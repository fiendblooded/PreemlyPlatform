declare module 'pdf-parse' {
  interface IPDFData {
    text: string;
    numpages: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    version: string;
  }

  function parse(dataBuffer: Buffer | ArrayBuffer): Promise<IPDFData>;
  export default parse;
}
