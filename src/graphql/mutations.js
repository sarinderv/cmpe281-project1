/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createFile = /* GraphQL */ `
  mutation CreateFile(
    $input: CreateFileInput!
    $condition: ModelFileConditionInput
  ) {
    createFile(input: $input, condition: $condition) {
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
export const updateFile = /* GraphQL */ `
  mutation UpdateFile(
    $input: UpdateFileInput!
    $condition: ModelFileConditionInput
  ) {
    updateFile(input: $input, condition: $condition) {
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
export const deleteFile = /* GraphQL */ `
  mutation DeleteFile(
    $input: DeleteFileInput!
    $condition: ModelFileConditionInput
  ) {
    deleteFile(input: $input, condition: $condition) {
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
