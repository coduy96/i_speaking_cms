import React from "react";

import { User as FirebaseUser } from "firebase/auth";
import {
  Authenticator,
  buildCollection,
  buildProperty,
  buildSchema,
  EntityReference,
  FirebaseCMSApp,
  NavigationBuilder,
  NavigationBuilderProps
} from "@camberi/firecms";

import "typeface-rubik";
import "typeface-space-mono";

// TODO: Replace with your config
const firebaseConfig = {
  apiKey: "AIzaSyDIBvd6ulstFqykOFkwkvRdct5mYa8N180",
  authDomain: "audiobook-7b39b.firebaseapp.com",
  projectId: "audiobook-7b39b",
  storageBucket: "audiobook-7b39b.appspot.com",
  messagingSenderId: "727870458055",
  appId: "1:727870458055:web:4af5f45e76286b2f8d56e2"
};

type AudioBook = {
  name: string;
  price: number;
  status: string;
  published: boolean;
  related_audiobook: EntityReference[];
  book_cover: string;
  tags: string[];
  description: string;
  categories: string[];
  publisher: {
    name: string;
    external_id: string;
  },
  publish_date: Date
}

const audioBookSchema = buildSchema<AudioBook>({
  name: "AudioBook",
  properties: {
    name: {
      title: "Name",
      validation: { required: true },
      dataType: "string"
    },
    price: {
      title: "Price",
      validation: {
        required: true,
        requiredMessage: "You must set a price between 0 and 1000",
        min: 0,
        max: 1000
      },
      description: "Price with range validation",
      dataType: "number"
    },
    status: {
      title: "Status",
      validation: { required: true },
      dataType: "string",
      description: "Should this product be visible in the website",
      longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
      config: {
        enumValues: {
          private: "Private",
          public: "Public"
        }
      }
    },
    published: ({ values }) => buildProperty({
      title: "Published",
      dataType: "boolean",
      columnWidth: 100,
      disabled: (
        values.status === "public"
          ? false
          : {
            clearOnDisabled: true,
            disabledMessage: "Status must be public in order to enable this the published flag"
          }
      )
    }),
    related_audiobook: {
      dataType: "array",
      title: "Related audio book",
      description: "Reference to self",
      of: {
        dataType: "reference",
        path: "products"
      }
    },
    book_cover: buildProperty({ // The `buildProperty` method is an utility function used for type checking
      title: "Book cover",
      dataType: "string",
      config: {
        storageMeta: {
          mediaType: "image",
          storagePath: "images",
          acceptedFiles: ["image/*"]
        }
      }
    }),
    tags: {
      title: "Tags",
      description: "Example of generic array",
      validation: { required: true },
      dataType: "array",
      of: {
        dataType: "string"
      }
    },
    description: {
      title: "Description",
      description: "Not mandatory but it'd be awesome if you filled this up",
      longDescription: "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
      dataType: "string",
      columnWidth: 300
    },
    categories: {
      title: "Categories",
      validation: { required: true },
      dataType: "array",
      of: {
        dataType: "reference",
        path: "bookcategories",
        previewProperties: ["title"]
    }
    },
    publisher: {
      title: "Publisher",
      description: "This is an example of a map property",
      dataType: "map",
      properties: {
        name: {
          title: "Name",
          dataType: "string"
        },
        external_id: {
          title: "External id",
          dataType: "string"
        }
      }
    },
    publish_date: {
      title: "Publish date",
      dataType: "timestamp"
    }
  }
});

const chapterSchema = buildSchema({
  name: "Chapters",
  properties: {
    title: {
      title: "Title",
      validation: { required: true },
      dataType: "string"
    },
    video: {
      title: "Audio file",
      dataType: "string",
      validation: { required: false },
      config: {
        storageMeta: {
          mediaType: "audio",
          storagePath: "audiofile",
          acceptedFiles: ["audio/*"]
        }
      }
    }
  }
});

const bookcategoriesSchema = buildSchema({
  name: "BookCategories",
  properties: {
    title: {
      title: "Title",
      validation: { required: true },
      dataType: "string"
    },
  }
});

export default function App() {

  const navigation: NavigationBuilder = async ({
    user,
    authController
  }: NavigationBuilderProps) => {

    return ({
      collections: [
        buildCollection({
          path: "products",
          schema: audioBookSchema,
          name: "Audiobooks",
          permissions: ({ authController }) => ({
            edit: true,
            create: true,
            // we have created the roles object in the navigation builder
            delete: authController.extra.roles.includes("admin")
          }),
          subcollections: [
            buildCollection({
              name: "Chapters",
              path: "chapters",
              schema: chapterSchema
            })
          ]
        }),
        buildCollection({path:"bookcategories", schema: bookcategoriesSchema, name: 'Book Categories'})

      ]
    });
  };

  const myAuthenticator: Authenticator<FirebaseUser> = async ({
    user,
    authController
  }) => {
    // You can throw an error to display a message
    if (user?.email?.includes("flanders")) {
      throw Error("Stupid Flanders!");
    }

    console.log("Allowing access to", user?.email);
    // This is an example of retrieving async data related to the user
    // and storing it in the user extra field.
    const sampleUserData = await Promise.resolve({
      roles: ["admin"]
    });
    authController.setExtra(sampleUserData);
    return true;
  };

  return <FirebaseCMSApp
    name={"Lisen CMS"}
    authentication={myAuthenticator}
    navigation={navigation}
    firebaseConfig={firebaseConfig}
  />;
}