declare module "dagre" {
  export namespace graphlib {
    interface GraphOptions {
      rankdir?: string;
      nodesep?: number;
      ranksep?: number;
      marginx?: number;
      marginy?: number;
      [key: string]: unknown;
    }

    interface NodeConfig {
      width?: number;
      height?: number;
      [key: string]: unknown;
    }

    interface EdgeConfig {
      [key: string]: unknown;
    }

    class Graph {
      constructor(options?: {
        directed?: boolean;
        multigraph?: boolean;
        compound?: boolean;
      });
      setGraph(options: GraphOptions): this;
      setDefaultEdgeLabel(
        callback: () => string | Record<string, unknown>,
      ): this;
      setNode(id: string, options: NodeConfig): this;
      setEdge(source: string, target: string, options?: EdgeConfig): this;
      node(id: string): {
        x: number;
        y: number;
        width: number;
        height: number;
        [key: string]: unknown;
      };
      edge(source: string, target: string): EdgeConfig;
      nodes(): string[];
      edges(): { v: string; w: string }[];
    }
  }
  export function layout(graph: graphlib.Graph): void;
}
