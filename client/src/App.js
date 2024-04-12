import React, { useEffect, useState } from 'react';

function App() {
  const [backendData, setBackendData] = useState({ users: [] }); // Initialize as an object with an empty "users" array

  useEffect(() => {
    fetch("/api")
      .then((response) => response.json())
      .then((data) => setBackendData(data))
      .catch((error) => console.error('Error fetching data:', error)); // Add error handling
  }, []);

  return (
    <div>
      {(
        backendData.users.map((user, index) => (
          <React.Fragment key={user}>
            {user}
            {index !== backendData.users.length - 1 && <br/>}
          </React.Fragment>
        ))
      )}
    </div>
  );
}

export default App;
