/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getFile = /* GraphQL */ `
  query GetFile($id: ID!) {
    getFile(id: $id) {
      id
      fileName
      fileUploadTime
      description
      contentType
      userFirstName
      userLastName
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listFiles = /* GraphQL */ `
  query ListFiles(
    $filter: ModelFileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        fileName
        fileUploadTime
        description
        contentType
        userFirstName
        userLastName
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
