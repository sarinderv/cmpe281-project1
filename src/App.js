import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage, Auth, Hub } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut, AmplifyS3Image } from '@aws-amplify/ui-react';
import { listFiles } from './graphql/queries';
import { createFile as createFileMutation, deleteFile as deleteFileMutation } from './graphql/mutations';

// see https://docs.amplify.aws/lib/storage/configureaccess/q/platform/js/
Storage.configure({ level: 'private' });

function App() {

  var initialFormState = { fileName: '', description: '', fileUploadTime: '', userFirstName: '' }

  const listener = (data) => {
    switch (data.payload.event) {
      case 'signIn':
        console.info('user signed in');
        break;
      case 'signOut':
        console.info('user signed out');
        break;
      case 'signIn_failure':
        console.error('user sign in failed');
        break;
      case 'configured':
        console.info('the Auth module is configured');
        break;
      default:
        console.error('unknown event: ', data.payload.event);
    }
  }
  Hub.listen('auth', listener);

  const [userSession, setUserSession] = useState({username: ''});
  const [files, setFiles] = useState([]);
  const [content, setContent] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    fetchSession();
    fetchFiles();
  }, []);

  async function fetchSession() {
    let sess = await Auth.currentUserInfo();
    Auth.currentCredentials().then( cred => console.log(cred.identityId) );
    console.log("session: ", sess);
    setUserSession(sess);
  }

  async function fetchFiles() {
    try {
      const apiData = await API.graphql({ query: listFiles });
      const filesFromAPI = apiData.data.listFiles.items;
      await Promise.all(filesFromAPI.map(async file => {
        const content = await Storage.get(fileNameWithPrefix());
        file.content = content;
        return file;
      }))
      setFiles(apiData.data.listFiles.items);
    } catch (e) {
      console.error('error fetching files', e);
      setErrorMessages(e.errors);
    }
  }

  async function createFile() {
    if (!formData.fileName || !formData.fileUploadTime || !formData.contentType) return;
    await API.graphql({ query: createFileMutation, variables: { input: formData } });
    await Storage.put(formData.fileName, content);
    fetchFiles();
    setFormData(initialFormState);
  }

  async function deleteFile({ id }) {
    await API.graphql({ query: deleteFileMutation, variables: { input: { id } } });
    await Storage.remove(id);
    fetchFiles();
  }

  async function onFileChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, contentType: file.type, fileName: file.name, fileUploadTime: new Date() });
    setContent(file);
  }

  function fileNameWithPrefix() {
    let prefix = '';//userSession.attributes.sub +"/";
    return prefix + formData.fileName;
  }

  return (
    <div className="App">
      <h1>My Files App</h1>
      <input
        readOnly
        placeholder="Username"
        value={userSession.username}
      />
      <br />
      <input
        readOnly
        placeholder="File Upload Time"
        value={formData.fileUploadTime}
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
        {
          errorMessages && (errorMessages.map((err, i) => <p key={i} class='err'> {err.message} </p>))
        }
        <table border="1">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Updated</th>
              <th>Uploaded</th>
              <th>Download</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {
              files.map(file => (
                <tr key={file.id}>
                  <td>{file.id}</td>
                  <td>{file.fileName}</td>
                  <td>{file.description}</td>
                  <td>{file.updatedAt}</td>
                  <td>{file.fileUploadTime}</td>
                  <td>
                    {
                      file.content && <a href={file.content} download={file.fileName}>
                        {
                          file.contentType.startsWith('image/') ? <AmplifyS3Image level="private" imgKey={file.fileName} alt={file.fileName} /> : <>{file.fileName}</>
                        }
                      </a>
                    }
                  </td>
                  <td><button onClick={() => deleteFile(file)}>Delete file</button></td>
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