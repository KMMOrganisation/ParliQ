import { VideoMetadata, TranscriptSegment, ProcessedVideo, ExtractedEntity, IngestionProgress } from '../types/video';
import { ParliQApi, IngestedVideo } from './parliQApi';

export class VideoIngestionService {

    static async extractVideoId(url: string): Promise<string> {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        throw new Error('Invalid YouTube URL format');
    }

    static async extractChannelId(url: string): Promise<string> {
        const patterns = [
            /youtube\.com\/channel\/([^\/\n?#]+)/,
            /youtube\.com\/c\/([^\/\n?#]+)/,
            /youtube\.com\/@([^\/\n?#]+)/,
            /youtube\.com\/user\/([^\/\n?#]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        throw new Error('Invalid YouTube channel URL format');
    }

    static async fetchVideoMetadata(videoId: string): Promise<VideoMetadata> {
        if (!this.YOUTUBE_API_KEY) {
            throw new Error('YouTube API key not configured. Set VITE_YOUTUBE_API_KEY in your .env file');
        }

        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${this.YOUTUBE_API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            throw new Error('Video not found or not accessible');
        }

        const video = data.items[0];
        const snippet = video.snippet;
        const contentDetails = video.contentDetails;

        // Parse ISO 8601 duration (PT4M13S -> seconds)
        const duration = this.parseDuration(contentDetails.duration);

        return {
            id: videoId,
            title: snippet.title,
            description: snippet.description,
            channel: snippet.channelTitle,
            channelId: snippet.channelId,
            publishedAt: snippet.publishedAt,
            duration,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.default.url
        };
    }

    static async fetchTranscript(videoId: string): Promise<TranscriptSegment[]> {
        try {
            const transcript = await YoutubeTranscript.fetchTranscript(videoId);

            return transcript.map((segment: any) => ({
                text: segment.text,
                start: segment.offset / 1000, // Convert ms to seconds
                duration: segment.duration / 1000,
                end: (segment.offset + segment.duration) / 1000
            }));
        } catch (error) {
            throw new Error(`Failed to fetch transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async extractEntities(transcript: TranscriptSegment[], metadata: VideoMetadata): Promise<ExtractedEntity[]> {
        if (!this.GEMINI_API_KEY) {
            console.warn('Gemini API key not configured. Using basic entity extraction.');
            return this.basicEntityExtraction(transcript);
        }

        try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(this.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

            const fullText = transcript.map(seg => seg.text).join(' ');

            const prompt = `
        Analyze this UK parliamentary transcript and extract entities. Return JSON array with objects containing:
        - type: "Person", "Party", "Policy", "Location", "Event", or "Quote"
        - text: the entity text
        - startTime: approximate start time in seconds
        - endTime: approximate end time in seconds  
        - confidence: 0-1 confidence score
        - context: surrounding context

        Focus on UK political entities: MPs, ministers, political parties, policies, bills, constituencies, etc.

        Transcript: "${fullText.substring(0, 8000)}"
        
        Video: "${metadata.title}" by ${metadata.channel}
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            try {
                const entities = JSON.parse(text);
                return this.validateAndMapEntities(entities, transcript);
            } catch (parseError) {
                console.warn('Failed to parse AI entity extraction, falling back to basic extraction');
                return this.basicEntityExtraction(transcript);
            }
        } catch (error) {
            console.warn('AI entity extraction failed, using basic extraction:', error);
            return this.basicEntityExtraction(transcript);
        }
    }

    static basicEntityExtraction(transcript: TranscriptSegment[]): ExtractedEntity[] {
        const entities: ExtractedEntity[] = [];

        // Basic patterns for UK political entities
        const patterns = {
            Person: [
                /\b(Mr|Mrs|Ms|Dr|Sir|Dame|Lord|Lady)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
                /\b(Prime Minister|Chancellor|Secretary of State|Minister)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g
            ],
            Party: [
                /\b(Conservative|Labour|Liberal Democrat|SNP|Plaid Cymru|Green|UKIP|Brexit Party)\b/gi,
                /\b(Tory|Tories)\b/gi
            ],
            Policy: [
                /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(Bill|Act|Policy|Strategy|Programme)\b/g,
                /\bNHS|National Health Service\b/gi
            ],
            Location: [
                /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(constituency|borough|council)\b/gi,
                /\b(England|Scotland|Wales|Northern Ireland|UK|United Kingdom)\b/gi
            ]
        };

        transcript.forEach(segment => {
            Object.entries(patterns).forEach(([type, patternList]) => {
                patternList.forEach(pattern => {
                    let match;
                    while ((match = pattern.exec(segment.text)) !== null) {
                        entities.push({
                            type: type as ExtractedEntity['type'],
                            text: match[0],
                            startTime: segment.start,
                            endTime: segment.end,
                            confidence: 0.7,
                            context: segment.text
                        });
                    }
                });
            });
        });

        return entities;
    }

    static validateAndMapEntities(aiEntities: any[], transcript: TranscriptSegment[]): ExtractedEntity[] {
        return aiEntities
            .filter(entity =>
                entity.type &&
                entity.text &&
                typeof entity.startTime === 'number' &&
                typeof entity.endTime === 'number'
            )
            .map(entity => ({
                type: entity.type,
                text: entity.text,
                startTime: Math.max(0, entity.startTime),
                endTime: Math.min(transcript[transcript.length - 1]?.end || 0, entity.endTime),
                confidence: Math.min(1, Math.max(0, entity.confidence || 0.5)),
                context: entity.context || ''
            }));
    }

    static generateRDF(metadata: VideoMetadata, transcript: TranscriptSegment[], entities: ExtractedEntity[]): string {
        const writer = new Writer({
            prefixes: {
                pol: 'http://politics.kg/ontology#',
                rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
                xsd: 'http://www.w3.org/2001/XMLSchema#',
                dct: 'http://purl.org/dc/terms/'
            }
        });

        const videoUri = namedNode(`http://politics.kg/video/${metadata.id}`);
        const channelUri = namedNode(`http://politics.kg/channel/${metadata.channelId}`);

        // Video metadata
        writer.addQuad(quad(videoUri, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://politics.kg/ontology#Video')));
        writer.addQuad(quad(videoUri, namedNode('http://purl.org/dc/terms/title'), literal(metadata.title)));
        writer.addQuad(quad(videoUri, namedNode('http://purl.org/dc/terms/description'), literal(metadata.description)));
        writer.addQuad(quad(videoUri, namedNode('http://politics.kg/ontology#duration'), literal(metadata.duration.toString(), namedNode('http://www.w3.org/2001/XMLSchema#integer'))));
        writer.addQuad(quad(videoUri, namedNode('http://purl.org/dc/terms/created'), literal(metadata.publishedAt, namedNode('http://www.w3.org/2001/XMLSchema#dateTime'))));
        writer.addQuad(quad(videoUri, namedNode('http://politics.kg/ontology#url'), literal(metadata.url)));

        // Channel
        writer.addQuad(quad(channelUri, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://politics.kg/ontology#Channel')));
        writer.addQuad(quad(channelUri, namedNode('http://www.w3.org/2000/01/rdf-schema#label'), literal(metadata.channel)));
        writer.addQuad(quad(videoUri, namedNode('http://politics.kg/ontology#publishedBy'), channelUri));

        // Transcript segments
        transcript.forEach((segment, index) => {
            const segmentUri = namedNode(`http://politics.kg/video/${metadata.id}/segment/${index}`);
            writer.addQuad(quad(segmentUri, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://politics.kg/ontology#TranscriptSegment')));
            writer.addQuad(quad(segmentUri, namedNode('http://politics.kg/ontology#text'), literal(segment.text)));
            writer.addQuad(quad(segmentUri, namedNode('http://politics.kg/ontology#startTime'), literal(segment.start.toString(), namedNode('http://www.w3.org/2001/XMLSchema#decimal'))));
            writer.addQuad(quad(segmentUri, namedNode('http://politics.kg/ontology#endTime'), literal(segment.end.toString(), namedNode('http://www.w3.org/2001/XMLSchema#decimal'))));
            writer.addQuad(quad(videoUri, namedNode('http://politics.kg/ontology#hasSegment'), segmentUri));
        });

        // Entities
        entities.forEach((entity, index) => {
            const entityUri = namedNode(`http://politics.kg/entity/${metadata.id}/${index}`);
            writer.addQuad(quad(entityUri, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode(`http://politics.kg/ontology#${entity.type}`)));
            writer.addQuad(quad(entityUri, namedNode('http://www.w3.org/2000/01/rdf-schema#label'), literal(entity.text)));
            writer.addQuad(quad(entityUri, namedNode('http://politics.kg/ontology#startTime'), literal(entity.startTime.toString(), namedNode('http://www.w3.org/2001/XMLSchema#decimal'))));
            writer.addQuad(quad(entityUri, namedNode('http://politics.kg/ontology#endTime'), literal(entity.endTime.toString(), namedNode('http://www.w3.org/2001/XMLSchema#decimal'))));
            writer.addQuad(quad(entityUri, namedNode('http://politics.kg/ontology#confidence'), literal(entity.confidence.toString(), namedNode('http://www.w3.org/2001/XMLSchema#decimal'))));
            writer.addQuad(quad(entityUri, namedNode('http://politics.kg/ontology#context'), literal(entity.context)));
            writer.addQuad(quad(videoUri, namedNode('http://politics.kg/ontology#hasEntity'), entityUri));
        });

        return writer.end();
    }

    static async processVideo(
        url: string,
        onProgress?: (progress: IngestionProgress) => void
    ): Promise<ProcessedVideo> {
        const videoId = await this.extractVideoId(url);

        try {
            // Stage 1: Fetch metadata
            onProgress?.({
                videoId,
                stage: 'fetching',
                progress: 10,
                message: 'Fetching video metadata...'
            });

            const metadata = await this.fetchVideoMetadata(videoId);

            // Stage 2: Extract transcript
            onProgress?.({
                videoId,
                stage: 'transcribing',
                progress: 30,
                message: 'Extracting transcript...'
            });

            const transcript = await this.fetchTranscript(videoId);

            // Stage 3: Extract entities
            onProgress?.({
                videoId,
                stage: 'extracting',
                progress: 60,
                message: 'Extracting political entities...'
            });

            const entities = await this.extractEntities(transcript, metadata);

            // Stage 4: Generate RDF
            onProgress?.({
                videoId,
                stage: 'generating_rdf',
                progress: 90,
                message: 'Generating knowledge graph...'
            });

            const rdfTriples = this.generateRDF(metadata, transcript, entities);

            onProgress?.({
                videoId,
                stage: 'complete',
                progress: 100,
                message: 'Video processing complete!'
            });

            return {
                metadata,
                transcript,
                entities,
                rdfTriples
            };

        } catch (error) {
            onProgress?.({
                videoId,
                stage: 'error',
                progress: 0,
                message: 'Processing failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }

    private static parseDuration(isoDuration: string): number {
        const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 0;

        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = parseInt(match[3] || '0');

        return hours * 3600 + minutes * 60 + seconds;
    }
}