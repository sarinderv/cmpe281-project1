import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listFiles } from './graphql/queries';
import { createFile as createFileMutation, deleteFile as deleteFileMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' }

function App() {
  const [files, setFiles] = useState([]);
  const [content, setContent] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    const apiData = await API.graphql({ query: listFiles });
    const filesFromAPI = apiData.data.listFiles.items;
    await Promise.all(filesFromAPI.map(async file => {
      if (file.content) {
        const content = await Storage.get(file.content);
        file.content = content;
      }
      return file;
    }))
    setFiles(apiData.data.listFiles.items);
  }

  async function createFile() {
    if (!formData.name || !formData.description || !formData.content) return;
    const apiData = await API.graphql({ query: createFileMutation, variables: { input: formData } });
    await Storage.put(apiData.data.createFile.id, content);
    fetchFiles();
    setFormData(initialFormState);
  }

  async function deleteFile({ id }) {
    const newFilesArray = files.filter(file => file.id !== id);
    setFiles(newFilesArray);
    await API.graphql({ query: deleteFileMutation, variables: { input: { id } } });
    await Storage.remove(id);
  }

  async function onFileChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, content: file.name });
    setContent(file);
  }

  return (
    <div className="App">
      <h1>My Files App</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value })}
        placeholder="File name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value })}
        placeholder="File description"
        value={formData.description}
      />
      <input
        type="file"
        onChange={onFileChange}
      />
      <button onClick={createFile}>Create File</button>
      <hr />
      <div style={{ marginBottom: 30 }}>
        <table border="1">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Delete</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            {
              files.map(file => (
                <tr key={file.id}>
                  <td>{file.id}</td>
                  <td>{file.name}</td>
                  <td>{file.description}</td>
                  <td><button onClick={() => deleteFile(file)}>Delete file</button></td>
                  {
                    file.content && <td><img src={file.content} style={{ width: 40 }} alt="file" /></td>
                  }
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);