# @adkinn/fifth-edition-srd-mcp

A stdio MCP server for the SRD 5.2.1 monster and condition dataset.

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

## License

The MCP server code is MIT licensed. The bundled dataset is separately licensed
under CC BY 4.0; see `data/LICENSE` for its attribution requirements.
