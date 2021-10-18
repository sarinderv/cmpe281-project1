import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listFiles } from './graphql/queries';
import { createFile as createFileMutation, deleteFile as deleteFileMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' }

function App() {
  const [files, setFiles] = useState([]);
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
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createFileMutation, variables: { input: formData } });
    if (formData.content) {
      const content = await Storage.get(formData.content);
      formData.content = content;
    }
    setFiles([...files, formData]);
    setFormData(initialFormState);
  }

  async function deleteFile({ id }) {
    const newFilesArray = files.filter(file => file.id !== id);
    setFiles(newFilesArray);
    await API.graphql({ query: deleteFileMutation, variables: { input: { id } } });
  }

  async function onFileChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, content: file.name });
    await Storage.put(file.name, file);
    fetchFiles();
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
      <div style={{ marginBottom: 30 }}>
        {
          files.map(file => (
            <div key={file.id || file.name}>
              <h2>{file.name}</h2>
              <p>{file.description}</p>
              <button onClick={() => deleteFile(file)}>Delete file</button>
              {
                file.content && <img src={file.content} style={{ width: 400 }} alt="file"/>
              }
            </div>
          ))
        }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);