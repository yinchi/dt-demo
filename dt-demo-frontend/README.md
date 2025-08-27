# Frontend for the DT demo Auth module

We use Vite to create a static frontend for our DT demo.

## Key Vite files

- `package.json`
    - Defines scripts we can run with `yarn`, e.g. `yarn build`, as well as the package dependencies.
- `vite.config.js`
    - Available pages should be added to the `build.rollupOptions.input` field.
- `nginx.conf`
    - Copied into the Docker container, controls routing
    - We have set up the following rules in order of priority:
        1. `/` and `/home` serve `index.html`
        2. `/assets/<filename>` serves the file `<filename>` from the assets folder
        3. `/foo/bar/baz` serves `foo/bar/baz.html`, for any level of nesting, as long as `foo` is not `assets`.
- `src/`
    - Our HTML and Typescript files for the frontend.
- `dist/`
    - Build output from `yarn build`.
    - We also call `yarn build` inside the Docker build; this is just a local copy.
- `flatten-html.sh`
    - Allows us to place `.html` files anywhere in our `src/` directory; the script will pull the corresponding files to the top-level directory `dist/`.

## A Vite page

The following are the minimum required for a Vite webpage:

- `vite.config.js` entry: ensures Vite exports the webpage, contains the path to the HTML file
- `.html file`: A simple skeleton file which loads in the root `.tsx` file
- `.tsx file`: Defines the page layout; may refer to other `.ts` and `.tsx` scripts/components.

Each webpage is assigned its own subdirectory in `src/`.

### Mantine

We use Mantine to provide a consistent visual look for our frontend.  The `src/common` directory contains reusable components for each webpage (e.g. the header and footer).

See the [Mantine user guide](https://mantine.dev/guides/vite/) for documentation on the available components and usage with Vite.
