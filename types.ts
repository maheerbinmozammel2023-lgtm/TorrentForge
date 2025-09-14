export enum TorrentType {
  V1 = 'v1',
  V2 = 'v2',
  Hybrid = 'hybrid',
}

export enum SourceType {
  Local = 'local',
  Cloud = 'cloud',
}

export interface TorrentInfo {
  sourceFiles?: File[];
  sourceUrl: string;
  sourceType: SourceType;
  torrentType: TorrentType;
  trackers: string[];
  pieceSize: string;
  isPrivate: boolean;
  comment: string;
}

export interface CreatedTorrentData extends TorrentInfo {
  infoHashV1?: string;
  infoHashV2?: string;
  fileName: string;
  fileSize: string;
  creationDate: string;
  totalPieces: number;
}
