# @adkinn/fifth-edition-srd-mcp

An MCP server for the SRD 5.2.1 monster and condition dataset. Run it as a
stdio subprocess, or import it and attach your own transport.

## Install

Add the package as a stdio MCP server using `npx`:

```json
{
  "mcpServers": {
    "srd-521": {
      "command": "npx",
      "args": ["-y", "@adkinn/fifth-edition-srd-mcp"]
    }
  }
}
```

The server provides `lookup_monster`, `lookup_condition`, `search_monsters`,
and `license`. Every successful data response includes the required CC BY 4.0
attribution in `_license`.

The server requires Node 20 or newer. Source, complete documentation, dataset
schemas, and attribution are available at
<https://github.com/adkinn/srd-5.2.1>.

## Embedding it

The stdio bin is one way to run the server, not the only one. The `/server`
subpath exports the server factory and the query layer with no filesystem
access, so the same code runs in a browser-standard runtime — a Cloudflare
Worker, Deno, an edge function — where the dataset is inlined at build time
rather than read from disk:

```js
import { createSrdData, createSrdServer } from "@adkinn/fifth-edition-srd-mcp/server";
import monsters from "@adkinn/fifth-edition-srd-mcp/data/monsters.json";
import conditions from "@adkinn/fifth-edition-srd-mcp/data/conditions.json";

const server = createSrdServer("1.4.0", createSrdData(monsters, conditions));
await server.connect(yourTransport);
```

`createSrdData` also returns the queries directly — `findMonster`,
`findCondition`, `searchMonsters`, plus the `monsters` and `conditions` arrays
and the `license` string — if you want the dataset without the MCP layer.

## License

The MCP server code is MIT licensed. The bundled dataset is separately licensed
under CC BY 4.0; see `data/LICENSE` for its attribution requirements.
