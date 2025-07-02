import React, { useState, useEffect, FormEvent } from 'react';
import { Users, MessageSquare, Calendar, Trophy, Send, X } from 'lucide-react';
import { auth, db } from '../firebase/firebaseConfig';
import { onAuthStateChanged, User, getIdToken } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, query, where, addDoc, onSnapshot, orderBy, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { getUserRole } from '../utils/getUserRole';

interface Group {
  id: string;
  name: string;
  topic: string;
  college: string;
  memberCount: number;
  domain?: string; // Added for mentor/faculty filtering
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

const mockGroups: Group[] = [
  {
    id: 'group1',
    name: 'AI Study Group',
    topic: 'Machine Learning Basics',
    college: 'IIT Delhi',
    memberCount: 10,
    domain: 'Artificial Intelligence',
  },
  {
    id: 'group2',
    name: 'Web Dev Club',
    topic: 'React and Node.js',
    college: 'IIT Chennai',
    memberCount: 15,
    domain: 'Web Development',
  },
];

const mockEvents: Event[] = [
  {
    id: 'event1',
    title: 'Tech Talk: AI in Education',
    date: 'March 22, 2025',
    time: '3:00 PM',
    location: 'Senate Hall',
  },
  {
    id: 'event2',
    title: 'Student Project Showcase',
    date: 'March 23, 2025',
    time: '2:00 PM',
    location: 'H05',
  },
];

const CollegeCommunity = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<{ college: string; role: string; fullName: string; expertiseAreas?: string[]; researchAreas?: string[] } | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const role = await getUserRole();
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              college: data.college || data.instituteName || '',
              role: role || data.role || '',
              fullName: data.fullName || data.startupName || data.founderName || 'User',
              expertiseAreas: data.expertiseAreas || [],
              researchAreas: data.researchAreas || [],
            });
          } else {
            setError('User data not found. Please complete your profile.');
            setIsLoading(false);
            return;
          }
        } catch (err) {
          setError('Failed to fetch user data.');
          setIsLoading(false);
          console.error('Error fetching user data:', err);
        }
      } else {
        setGroups(mockGroups);
        setEvents(mockEvents);
        setIsLoading(false);
      }
    });

    const fetchData = async () => {
      if (!currentUser || !userData) {
        return;
      }
      try {
        // Fetch groups
        let groupsQuery = query(collection(db, 'groups'));
        if (userData.role === 'student') {
          groupsQuery = query(collection(db, 'groups'), where('college', '==', userData.college));
        } else if (userData.role === 'mentor' && userData.expertiseAreas) {
          groupsQuery = query(collection(db, 'groups'), where('domain', 'in', userData.expertiseAreas));
        } else if (userData.role === 'faculty' && userData.researchAreas) {
          groupsQuery = query(collection(db, 'groups'), where('domain', 'in', userData.researchAreas));
        }
        const groupList: Group[] = [];
        const querySnapshot = await getDocs(groupsQuery);
        for (const groupDoc of querySnapshot.docs) {
          const membersSnapshot = await getDocs(collection(db, 'groups', groupDoc.id, 'group_members'));
          groupList.push({
            id: groupDoc.id,
            name: groupDoc.data().name,
            topic: groupDoc.data().topic,
            college: groupDoc.data().college,
            memberCount: membersSnapshot.size,
            domain: groupDoc.data().domain || '',
          });
        }
        setGroups(groupList);

        // Fetch events
        const eventsQuery = query(collection(db, 'events'), orderBy('date', 'asc'));
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventList: Event[] = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || '',
          date: doc.data().date || '',
          time: doc.data().time || '',
          location: doc.data().location || '',
        }));
        setEvents(eventList);
      } catch (err) {
        setError('Failed to load community data.');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && userData) {
      fetchData();
    }

    // Initialize Socket.IO
    let socketCleanup: (() => void) | undefined;
    const initSocket = async () => {
      if (currentUser) {
        try {
          const token = await getIdToken(currentUser);
          const newSocket = io('http://localhost:3001', {
            auth: { token },
          });
          setSocket(newSocket);

          newSocket.on('connect_error', (err) => {
            setError('Failed to connect to chat server.');
            console.error('Socket connection error:', err);
          });

          socketCleanup = () => {
            newSocket.disconnect();
          };
        } catch (err) {
          setError('Failed to initialize chat.');
          console.error('Socket initialization error:', err);
        }
      }
    };

    initSocket();

    return () => {
      unsubscribeAuth();
      if (socketCleanup) socketCleanup();
    };
  }, [currentUser, userData]);

  const handleJoinGroup = async (group: Group) => {
    if (!currentUser || !userData) {
      setIsSignInModalOpen(true);
      return;
    }
    try {
      const memberRef = doc(db, 'groups', group.id, 'group_members', currentUser.uid);
      await setDoc(memberRef, {
        userId: currentUser.uid,
        joinedAt: new Date().toISOString(),
      });
      socket?.emit('joinGroup', { groupId: group.id, userName: userData.fullName });
      setGroups(groups.map(g => g.id === group.id ? { ...g, memberCount: g.memberCount + 1 } : g));
      setSelectedGroup(group);
      setIsChatModalOpen(true);
    } catch (err) {
      setError('Failed to join group.');
      console.error('Error joining group:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">College Community - {userData?.college || 'CollabUp'}</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 text-red-300 rounded-lg border border-red-800">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center text-gray-400">Loading community...</div>
      )}

      {!isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-[#1E293B] p-6 rounded-xl">
              <Users className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{groups.reduce((sum, g) => sum + g.memberCount, 0)}+</h3>
              <p className="text-gray-400">Active Students</p>
            </div>
            <div className="bg-[#1E293B] p-6 rounded-xl">
              <MessageSquare className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{groups.length}</h3>
              <p className="text-gray-400">Study Groups</p>
            </div>
            <div className="bg-[#1E293B] p-6 rounded-xl">
              <Calendar className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{events.length}</h3>
              <p className="text-gray-400">Upcoming Events</p>
            </div>
            <div className="bg-[#1E293B] p-6 rounded-xl">
              <Trophy className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{groups.length * 2}+</h3>
              <p className="text-gray-400">Success Stories</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1E293B] p-8 rounded-xl">
              <h2 className="text-2xl font-semibold mb-6 text-white">Upcoming Events</h2>
              {events.length === 0 && (
                <p className="text-gray-400">No upcoming events found.</p>
              )}
              <div className="space-y-6">
                {events.map((event) => (
                  <div key={event.id} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-white">{event.title}</h3>
                    <p className="text-gray-400">{event.date} at {event.time}</p>
                    <p className="text-gray-400">{event.location}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1E293B] p-8 rounded-xl">
              <h2 className="text-2xl font-semibold mb-6 text-white">Active Study Groups</h2>
              {groups.length === 0 && (
                <p className="text-gray-400">No study groups found for your college.</p>
              )}
              <div className="space-y-6">
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-4 bg-[#0F172A] rounded-lg">
                    <div>
                      <h3 className="font-semibold text-white">{group.name}</h3>
                      <p className="text-gray-400">{group.topic}</p>
                      <p className="text-gray-400">College: {group.college}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{group.memberCount} members</p>
                      <button
                        onClick={() => handleJoinGroup(group)}
                        className="text-blue-400 text-sm hover:underline"
                      >
                        Join Group
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {isSignInModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] rounded-xl p-6 max-w-md w-full border border-gray-700 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Sign In Required</h3>
            <p className="text-gray-300 mb-6">
              Please sign in to access the college community.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setIsSignInModalOpen(false);
                  navigate('/login');
                }}
                className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignInModalOpen(false)}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isChatModalOpen && selectedGroup && (
        <ChatModal
          group={selectedGroup}
          socket={socket}
          currentUser={currentUser}
          userName={userData?.fullName || 'User'}
          onClose={() => setIsChatModalOpen(false)}
        />
      )}
    </div>
  );
};

const ChatModal = ({ group, socket, currentUser, userName, onClose }: { group: Group; socket: Socket | null; currentUser: User | null; userName: string; onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket || !currentUser) {
      setError('You must be signed in to chat.');
      return;
    }

    const messagesQuery = query(collection(db, 'groups', group.id, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageList: Message[] = [];
      snapshot.forEach((doc) => {
        messageList.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(messageList);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, (err) => {
      setError('Failed to load messages.');
      console.error('Error fetching messages:', err);
    });

    socket.on('message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    socket.on('userJoined', ({ userId, userName }) => {
      setMessages((prev) => [...prev, {
        id: `join-${userId}-${Date.now()}`,
        userId: 'system',
        userName: 'System',
        text: `${userName} joined the group`,
        timestamp: new Date().toISOString(),
      }]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    socket.on('typing', ({ userId, userName, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping && !prev.includes(userName)) {
          return [...prev, userName];
        } else if (!isTyping) {
          return prev.filter((name) => name !== userName);
        }
        return prev;
      });
    });

    socket.emit('joinGroup', { groupId: group.id, userName });

    return () => {
      unsubscribe();
      socket.off('message');
      socket.off('userJoined');
      socket.off('typing');
    };
  }, [socket, group.id, currentUser, userName]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !socket || !currentUser) {
      setError('Please enter a message or sign in.');
      return;
    }

    try {
      const message = {
        userId: currentUser.uid,
        userName,
        text: messageText,
        timestamp: new Date().toISOString(),
      };
      await addDoc(collection(db, 'groups', group.id, 'messages'), message);
      socket.emit('sendMessage', { groupId: group.id, ...message });
      setMessageText('');
      socket.emit('typing', { groupId: group.id, isTyping: false });
    } catch (err) {
      setError('Failed to send message.');
      console.error('Error sending message:', err);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    socket?.emit('typing', { groupId: group.id, isTyping: !!e.target.value, userName });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1E293B] rounded-xl p-6 max-w-lg w-full border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">{group.name} Chat</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg border border-red-800">
            {error}
          </div>
        )}
        <div className="h-96 overflow-y-auto mb-4 p-4 bg-[#0F172A] rounded-lg">
          {messages.map((msg) => (
            <div key={msg.id} className={`mb-2 ${msg.userId === 'system' ? 'text-gray-400 italic' : ''}`}>
              <span className="font-semibold text-blue-400">{msg.userName}: </span>
              <span>{msg.text}</span>
              <span className="text-xs text-gray-500 ml-2">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
          {typingUsers.length > 0 && (
            <div className="text-gray-400 italic">
              {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={handleTyping}
            className="flex-1 bg-[#0F172A] p-3 rounded-lg text-white"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700"
            disabled={!messageText.trim()}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CollegeCommunity;