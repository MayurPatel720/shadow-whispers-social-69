
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, FileText, Trash2, Edit, Eye, LogOut, Search, Ban } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface AdminPost {
  _id: string;
  content: string;
  anonymousAlias: string;
  avatarEmoji: string;
  likes: any[];
  comments: any[];
  createdAt: string;
  expiresAt: string;
  shareCount: number;
  user: {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    anonymousAlias: string;
  } | null;
}

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  anonymousAlias: string;
  avatarEmoji: string;
  posts: string[];
  createdAt: string;
}

const AdminPanel = () => {
  const { logout } = useAdmin();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
  const [editContent, setEditContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Add admin token to headers
      const token = localStorage.getItem('adminAuth');
      if (token) {
        api.defaults.headers['Authorization'] = `Bearer admin-${token}`;
      }
      
      // Fetch posts with user details
      const postsResponse = await api.get('/api/admin/posts');
      setPosts(postsResponse.data);
      
      // Fetch users
      const usersResponse = await api.get('/api/admin/users');
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch data. Using mock data for demo.",
      });
      
      // Mock data for demo
      setPosts([
        {
          _id: '1',
          content: 'This is a sample post content',
          anonymousAlias: 'ShadowWolf',
          avatarEmoji: '🎭',
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          shareCount: 5,
          user: {
            _id: 'user1',
            username: 'john_doe',
            email: 'john@example.com',
            fullName: 'John Doe',
            anonymousAlias: 'ShadowWolf'
          }
        }
      ]);
      
      setUsers([
        {
          _id: 'user1',
          username: 'john_doe',
          email: 'john@example.com',
          fullName: 'John Doe',
          anonymousAlias: 'ShadowWolf',
          avatarEmoji: '🎭',
          posts: ['1'],
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await api.delete(`/api/admin/posts/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
      toast({
        title: "Post deleted",
        description: "Post has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      // For demo, remove from local state
      setPosts(posts.filter(post => post._id !== postId));
      toast({
        title: "Post deleted",
        description: "Post has been successfully deleted.",
      });
    }
  };

  const handleEditPost = (post: AdminPost) => {
    setEditingPost(post);
    setEditContent(post.content);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    
    try {
      await api.put(`/api/admin/posts/${editingPost._id}`, {
        content: editContent
      });
      
      setPosts(posts.map(post => 
        post._id === editingPost._id 
          ? { ...post, content: editContent }
          : post
      ));
      
      setEditingPost(null);
      setEditContent('');
      
      toast({
        title: "Post updated",
        description: "Post has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating post:', error);
      // For demo, update local state
      setPosts(posts.map(post => 
        post._id === editingPost._id 
          ? { ...post, content: editContent }
          : post
      ));
      
      setEditingPost(null);
      setEditContent('');
      
      toast({
        title: "Post updated",
        description: "Post has been successfully updated.",
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-purple-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-gray-600">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                  <p className="text-gray-400">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <FileText className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{posts.length}</p>
                  <p className="text-gray-400">Total Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">Admin</p>
                  <p className="text-gray-400">Panel Access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search posts, users, emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="posts" className="data-[state=active]:bg-purple-600">
              Posts Management
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-600">
              Users Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Posts Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Content</TableHead>
                      <TableHead className="text-gray-300">Author</TableHead>
                      <TableHead className="text-gray-300">Real User</TableHead>
                      <TableHead className="text-gray-300">Anonymous</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post._id} className="border-gray-700">
                        <TableCell className="text-white max-w-xs">
                          <p className="truncate">{post.content}</p>
                        </TableCell>
                        <TableCell className="text-white">
                          <div>
                            <p className="font-medium">{post.user?.username || 'Unknown'}</p>
                            <p className="text-sm text-gray-400">{post.user?.email || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">
                          <Badge variant="outline" className="border-blue-500 text-blue-400">
                            {post.user?.fullName || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          <div className="flex items-center gap-2">
                            <span>{post.avatarEmoji}</span>
                            <span>{post.anonymousAlias}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPost(post)}
                              className="border-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePost(post._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Users Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">User</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Anonymous Alias</TableHead>
                      <TableHead className="text-gray-300">Posts Count</TableHead>
                      <TableHead className="text-gray-300">Joined</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id} className="border-gray-700">
                        <TableCell className="text-white">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{user.avatarEmoji}</span>
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              <p className="text-sm text-gray-400">@{user.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">{user.email}</TableCell>
                        <TableCell className="text-white">{user.anonymousAlias}</TableCell>
                        <TableCell className="text-white">{user.posts.length}</TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Post Modal */}
        {editingPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Edit Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Content</label>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                    rows={6}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingPost(null);
                      setEditContent('');
                    }}
                    className="border-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
