import './App.css';
import Header from './Header';
import Post from './Post';
import {Route,Routes} from "react-router-dom";
import Layout from './Layout';
import IndexPage from './pages/IndexPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import { UserContextProvider } from './UserContext';
import CreatePost from './CreatePost';
import PostPage from './PostPage';
import EditPost from './EditPost';

function App() {
  return (
    <UserContextProvider>
       <Routes>
      <Route path='/' element={<Layout/>}>
        <Route index element={
           <IndexPage/>
        } />

        <Route path="/login" element={
            <div>
              <LoginPage/>
            </div>
        } />

        <Route path="/register" element={
            <div>
              <RegisterPage/>
            </div>
        } />
        <Route path="/create" element={
            <div>
              <CreatePost/>
            </div>
        } />
        
        <Route path="/post/:id" element={
            <div>
              <PostPage/>
            </div>
        } />

        <Route path="/edit/:id" element={
            <div>
              <EditPost/>
            </div>
        } />

        
        
       
      </Route>
      
    </Routes>
    </UserContextProvider>
  );
}

export default App;
