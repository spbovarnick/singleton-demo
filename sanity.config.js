/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/admin/[[...index]]/page.jsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './sanity/env'
import {schema} from './sanity/schema'

// Define the actions that should be available for singleton documents
const singletonActions = new Set(["publish", "discardChanges", "restore"])

// Define the singleton document types
const singletonTypes = new Set(['about'])

export default defineConfig({
  basePath: '/admin',
  projectId,
  dataset,
  plugins: [
    // The structure tool is the top-level view within Sanity Studio that you will see on the far left-hand side the screen on the /admin route
    structureTool({
      // structure is a resolver function that takes two arguements `S`, an instance of the structure builder, and `context`, which holds context that may be used to customize the structure (e.g. `currentUser`, `dataset`, `projectId`, `schema`, `getClient`, `documentStore`)
      // The structure builder allows us to chain methods together to create a custom configuration of our studio's structure
      structure: (S) => 
      // a list goes into a collapsible pane and has a title, in this case 'Content'.
        S.list()
          .title('Content')
          // The `.items()` method defines the array of items that will be displayed in the list
          .items([
            // a `documentListItem` is just that--a single item that will appear in the list inside the collapsible pane
            S.listItem()
              // The `.title()` method sets the visible title of the list item
              .title('About')
              .id('about')
              .child(
                S.document()
                  .schemaType('about')
                  .documentId('about')
              ),
            S.documentTypeListItem('author').title('Authors'),
            S.documentTypeListItem('category').title('Category'),
            S.documentTypeListItem('post').title('Post'),
          ])
    }),
    // Vision is a tool that lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
  schema: {
    types: schema.types,
    // Filter out singleton types from the global “New document” menu options
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  document: {
    // For singleton types, filter out actions that are not explicitly included
    // in the `singletonActions` list defined above
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && singletonActions.has(action))
        : input,
  }
})
