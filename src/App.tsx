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
  apiKey: "AIzaSyBD3H2AmJ4IpEsiTk-0fpzJxsdbBIICeZc",
  authDomain: "ispeaking-asia.firebaseapp.com",
  projectId: "ispeaking-asia",
  storageBucket: "ispeaking-asia.appspot.com",
  messagingSenderId: "455706099866",
  appId: "1:455706099866:web:5c4b0a4414ccf1aa879f23"
};

type Questions = {
  name: string;
  part: string;
  published: boolean;
  description: string;
  topics: string[];
  publish_date: Date
}

const questionSchema = buildSchema<Questions>({
  name: "Questions",
  properties: {
    name: {
      title: "Question",
      validation: { required: true },
      dataType: "string"
    },
    part: {
      title: "Part",
      validation: { required: true },
      dataType: "string",
      config: {
        enumValues: {
          partOne: "Part 1",
          partTwo: "Part 2",
          partThree: "Part 3"
        }
      }
    },
    published: ({ values }) => buildProperty({
      title: "Published",
      dataType: "boolean",
      columnWidth: 100
    }),
    description: {
      title: "Description",
      description: "Not mandatory but it'd be awesome if you filled this up",
      dataType: "string",
      columnWidth: 300
    },
    topics: {
      title: "Topics",
      validation: { required: true },
      dataType: "array",
      of: {
        dataType: "reference",
        path: "topics",
        previewProperties: ["title"]
      }
    },
    publish_date: {
      title: "Publish date",
      dataType: "timestamp",
      validation: { required: true }
    }
  }
});

// const chapterSchema = buildSchema({
//   name: "Chapters",
//   properties: {
//     title: {
//       title: "Title",
//       validation: { required: true },
//       dataType: "string"
//     },
//     video: {
//       title: "Audio file",
//       dataType: "string",
//       validation: { required: false },
//       config: {
//         storageMeta: {
//           mediaType: "audio",
//           storagePath: "audiofile",
//           acceptedFiles: ["audio/*"]
//         }
//       }
//     }
//   }
// });

const topicsSchema = buildSchema({
  name: "topics",
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
          path: "questions",
          schema: questionSchema,
          name: "Questions",
          permissions: ({ authController }) => ({
            edit: true,
            create: true,
            // we have created the roles object in the navigation builder
            delete: authController.extra.roles.includes("admin")
          }),
          // subcollections: [
          //   buildCollection({
          //     name: "Chapters",
          //     path: "chapters",
          //     schema: chapterSchema
          //   })
          // ]
        }),
        buildCollection({ path: "topics", schema: topicsSchema, name: 'Topics' })

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