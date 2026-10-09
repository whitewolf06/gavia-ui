# Gavia UI 0.11.1 compatibility baseline

This immutable fixture records the released public API before the 0.12 work.
Source inventory comes from tag `v0.11.1`, commit
`314ff975d63ea61781955369ac1c853e4e6fd5cf`, in a clean checkout.
Declarations were extracted from the published npm archive, without rebuilding it.

- Archive: [gavia-ui-0.11.1.tgz](https://registry.npmjs.org/gavia-ui/-/gavia-ui-0.11.1.tgz)
- SHA256: `7ba2cc3efc5647727b5cad4751086190a71c746e10d6da44ed9c987f20050ccc`
- SRI: `sha512-4jx4h3BFcn0H/LIrzGPLilG6YCl3UwLKXZOpF/605+814dNiUYtYexXMbvsjtnQ2i91P4Xbkb1WbFtqPQDa6Fg==`

The contract stores 53 components, 447 tokens, public exports, CSS classes,
DOM markers, `pt` sections, callable generic metadata and declaration SHA256s.
The consumer is inherited from 0.9.1 with the one exact change approved by the
tagged `public-api-contracts-0.11` migration policy:
`ref<unknown>(null)` becomes `ref<number | null>(null)` for Select.
Its normalized SHA256 is
`e0a130adf7dba8ffafb4b41ef53a7fcc28f26312c8fc5fd8cba59a63b9f8ae06`.
The inherited comment and Russian fixture data remain unchanged.

The 0.12 gate compares this baseline without migration approval. The 0.9.1
fixture and its narrowly scoped 0.11 policy remain intact for historical tests.
Do not regenerate or edit released declarations to make a candidate pass.
