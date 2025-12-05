export interface SubtitleChunk {
  pageNumber: number;
  startTime: number;
  endTime: number;
  text: string;
}

export interface PresentationData {
  id: string;
  title: string;
  pdfUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  subtitles: SubtitleChunk[];
}

export const mockPresentation: PresentationData = {
  id: 'slide-demo',
  title: 'スライドUIの作り方',
  pdfUrl: '/slide-demo.pdf',
  audioUrl: '/slide-demo-audio.mp3', // This file doesn't exist yet, but we'll assume it does
  duration: 110,
  subtitles: [
    { pageNumber: 1, startTime: 0, endTime: 3.5, text: 'こんにちは。このデモでは、スライドと字幕が同期するUIの実装について解説します。' },
    { pageNumber: 1, startTime: 3.5, endTime: 8.2, text: 'まず、画面の構成です。上部にスライド、下部に字幕が表示されます。' },
    { pageNumber: 2, startTime: 8.2, endTime: 12.8, text: 'ユーザーが字幕をスクロールすると、追従してスライドが切り替わるのが大きな特徴です。' },
    { pageNumber: 2, startTime: 12.8, endTime: 18.0, text: 'これにより、ユーザーは自分のペースでコンテンツを「読む」ことができます。' },
    { pageNumber: 3, startTime: 18.0, endTime: 24.5, text: '逆に、スライドを直接スワイプしてページをめくることも可能です。' },
    { pageNumber: 3, startTime: 24.5, endTime: 29.8, text: 'その場合、字幕リストが自動で対応する位置までスクロールします。' },
    { pageNumber: 4, startTime: 29.8, endTime: 35.1, text: '字幕の各行をタップすると、その部分の音声が再生される機能も重要です。' },
    { pageNumber: 4, startTime: 35.1, endTime: 40.0, text: 'これにより、気になった箇所だけをすぐに聞き返すことができます。' },
    { pageNumber: 5, startTime: 40.0, endTime: 46.2, text: '画面下部のコントロールバーでは、再生・一時停止やシーク操作が可能です。' },
    { pageNumber: 5, startTime: 46.2, endTime: 50.5, text: '再生速度の変更も、ユーザーの学習効率を高めるために役立ちます。' },
    { pageNumber: 6, startTime: 50.5, endTime: 57.0, text: 'このUIを実現するためのキー技術は、スクロール位置を監視する Intersection Observer API です。' },
    { pageNumber: 6, startTime: 57.0, endTime: 62.3, text: 'パフォーマンスを維持しながら、スムーズな同期を実現します。' },
    { pageNumber: 7, startTime: 62.3, endTime: 68.0, text: 'また、PDFの描画には pdf.js ライブラリを利用しています。' },
    { pageNumber: 7, startTime: 68.0, endTime: 74.0, text: 'これにより、ブラウザ上で高品質なスライド表示が可能になります。' },
    { pageNumber: 8, startTime: 74.0, endTime: 80.0, text: '状態管理には、Reactの標準フックやContext APIを活用します。' },
    { pageNumber: 8, startTime: 80.0, endTime: 85.5, text: 'コンポーネント間で再生時間やアクティブページといった情報を共有します。' },
    { pageNumber: 9, startTime: 85.5, endTime: 91.0, text: 'レスポンシブ対応も重要です。特に、モバイルでの片手操作を意識したデザインが求められます。' },
    { pageNumber: 9, startTime: 91.0, endTime: 97.0, text: 'スライドの左右の端をタップしてページをめくれるようにするなどの工夫が考えられます。' },
    { pageNumber: 10, startTime: 97.0, endTime: 103.0, text: '以上が、スライド・字幕同期UIの基本的な設計と実装のアプローチです。' },
    { pageNumber: 10, startTime: 103.0, endTime: 110.0, text: 'ご清聴ありがとうございました。' },
  ],
};
