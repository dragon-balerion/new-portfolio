import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';

// --- Firebase Configuration ---
// PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="bg-[#0D0D0D] text-[#CCCCCC] font-sans min-h-screen">
            {user ? <Dashboard /> : <LoginPage />}
        </div>
    );
}

// --- Loading Screen Component ---
function LoadingScreen() {
    return (
        <div className="flex items-center justify-center h-screen bg-[#0D0D0D]">
            <div className="text-[#00FF41] font-mono text-xl">Initializing session...</div>
        </div>
    );
}

// --- Login Page Component ---
function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        signInWithEmailAndPassword(auth, email, password)
            .catch((err) => {
                setError('Failed to login. Please check your credentials.');
                console.error("Login Error:", err);
            });
    };

    return (
        <div className="flex items-center justify-center h-screen p-4">
            <div className="w-full max-w-md p-8 bg-[#1a1a1a] border border-[#00FF41]/20 rounded-lg shadow-[0_0_15px_rgba(0,255,65,0.1)]">
                <h2 className="text-3xl font-mono text-[#00FF41] text-center mb-6">Admin Login</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#00FF41]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF41]"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#00FF41]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF41]"
                            required
                        />
                    </div>
                    {error && <p className="text-[#FF0033] text-center">{error}</p>}
                    <button type="submit" className="w-full py-3 font-mono text-lg text-[#0D0D0D] bg-[#00FF41] rounded-md hover:shadow-[0_0_15px_rgba(0,255,65,0.7)] transition-shadow">
                        Authenticate
                    </button>
                </form>
            </div>
        </div>
    );
}

// --- Dashboard Component ---
function Dashboard() {
    const [cvFile, setCvFile] = useState(null);
    const [postTitle, setPostTitle] = useState('');
    const [postSummary, setPostSummary] = useState('');
    const [postContent, setPostContent] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 4000);
    };

    const handleCvUpload = (e) => {
        e.preventDefault();
        if (!cvFile) {
            showNotification('Please select a CV file first.', 'error');
            return;
        }
        const storageRef = ref(storage, 'Chandika-Nawodya-Senarathna-CV.pdf');
        uploadBytes(storageRef, cvFile)
            .then(() => {
                showNotification('CV uploaded successfully!', 'success');
                e.target.reset();
            })
            .catch(err => {
                showNotification('Error uploading CV.', 'error');
                console.error("CV Upload Error:", err);
            });
    };

    const handleBlogPost = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "blogPosts"), {
                title: postTitle,
                summary: postSummary,
                content: postContent,
                createdAt: serverTimestamp()
            });
            showNotification('Blog post created successfully!', 'success');
            setPostTitle('');
            setPostSummary('');
            setPostContent('');
        } catch (err) {
            showNotification('Error creating post.', 'error');
            console.error("Blog Post Error:", err);
        }
    };

    const handleLogout = () => {
        signOut(auth);
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 bg-[#0D0D0D]/80 backdrop-blur-md border-b border-[#00FF41]/20 p-4 flex justify-between items-center z-10">
                <h1 className="text-xl font-mono text-[#00FF41]">Admin Dashboard</h1>
                <button onClick={handleLogout} className="px-4 py-2 font-mono text-sm bg-transparent border-2 border-[#FF0033] text-[#FF0033] rounded-md hover:bg-[#FF0033] hover:text-[#0D0D0D] transition-colors">
                    Logout
                </button>
            </header>

            <main className="pt-24 px-4 md:px-8 max-w-4xl mx-auto">
                {notification.message && (
                    <div className={`p-3 mb-6 rounded-md text-center font-mono ${notification.type === 'success' ? 'bg-[#00FF41]/20 text-[#00FF41]' : 'bg-[#FF0033]/20 text-[#FF0033]'}`}>
                        {notification.message}
                    </div>
                )}

                {/* CV Upload Section */}
                <div className="p-6 mb-8 bg-[#1a1a1a] border border-[#00FF41]/20 rounded-lg">
                    <h3 className="text-2xl font-mono text-[#00FF41] mb-4">Upload New CV</h3>
                    <form onSubmit={handleCvUpload}>
                        <label htmlFor="cv-file" className="block mb-2 font-mono">CV File (PDF only)</label>
                        <input
                            type="file"
                            id="cv-file"
                            onChange={(e) => setCvFile(e.target.files[0])}
                            accept=".pdf"
                            className="w-full mb-4 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#00FF41] file:text-[#0D0D0D] hover:file:bg-[#00FF41]/80"
                            required
                        />
                        <button type="submit" className="px-6 py-2 font-mono text-md bg-transparent border-2 border-[#00FF41] text-[#00FF41] rounded-md hover:bg-[#00FF41] hover:text-[#0D0D0D] transition-colors">
                            Upload CV
                        </button>
                    </form>
                </div>

                {/* Blog Post Section */}
                <div className="p-6 mb-8 bg-[#1a1a1a] border border-[#00FF41]/20 rounded-lg">
                    <h3 className="text-2xl font-mono text-[#00FF41] mb-4">Create New Blog Post</h3>
                    <form onSubmit={handleBlogPost} className="space-y-4">
                        <div>
                            <label htmlFor="post-title" className="block mb-2 font-mono">Title</label>
                            <input
                                type="text"
                                id="post-title"
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value)}
                                className="w-full px-4 py-2 bg-[#0D0D0D] border border-[#00FF41]/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00FF41]"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="post-summary" className="block mb-2 font-mono">Summary</label>
                            <textarea
                                id="post-summary"
                                value={postSummary}
                                onChange={(e) => setPostSummary(e.target.value)}
                                className="w-full h-24 px-4 py-2 bg-[#0D0D0D] border border-[#00FF41]/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00FF41]"
                                required
                            ></textarea>
                        </div>
                        <div>
                            <label htmlFor="post-content" className="block mb-2 font-mono">Full Content</label>
                            <textarea
                                id="post-content"
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                className="w-full h-48 px-4 py-2 bg-[#0D0D0D] border border-[#00FF41]/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00FF41]"
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="px-6 py-2 font-mono text-md bg-transparent border-2 border-[#00FF41] text-[#00FF41] rounded-md hover:bg-[#00FF41] hover:text-[#0D0D0D] transition-colors">
                            Create Post
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}
