# Server rendering and hydration

Import the package normally in a Vue SSR application. Library modules do not
access `window` or the DOM at import time; browser effects attach in lifecycle
hooks. Import CSS explicitly through your application's supported SSR asset
pipeline and render the chosen theme attribute in the initial HTML.

Create a fresh Vue application and install optional `WlConfig` and services for
each server request. Service state belongs to that Vue application. Do not share
application instances or request-specific models between requests.

Render the same component tree, model values and locale on the server and during
initial hydration. Library-generated IDs are scoped to an application root;
conditional changes before hydration can still change the rendered tree. Supply
stable application IDs for fields or relationships that need an explicit name.
Use `WlField` slot values to connect the actual input's ID and descriptions.

Overlay opening, media-query behavior, focus and live announcements take effect
in the browser. Consumer code must guard its own browser APIs. Server rendering
does not prove keyboard behavior or screen-reader announcements.

The separately authorized installed-package verification checks Node import,
SSR and browser hydration against supported Vue consumer versions. See
[compatibility](compatibility.md) and [maintainer checks](../maintainers/quality.md)
for the distinction between the public contract and recorded validation.
