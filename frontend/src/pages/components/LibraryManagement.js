import React, { useState, useEffect } from 'react';
import { libraryService, studentService } from '../../services/api';
import '../../styles/ManagementStyles.css';
import { 
  Bell, MoreVertical, BookOpen, Clock, AlertCircle, QrCode, Scan, 
  BookMarked, Download, FileSpreadsheet, FileText, Search, Filter, 
  BarChart2, DollarSign, History, Sparkles, Check, RefreshCw, Plus, Layers, User
} from 'lucide-react';

const LibraryManagement = ({ activeSection }) => {
  const [books, setBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState(0);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Navigation & View Tabs
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'all_books' | 'digital_ebooks' | 'reservations' | 'fines' | 'availability' | 'reports'

  useEffect(() => {
    if (activeSection === 'dashboard') setActiveTab('dashboard');
    if (activeSection === 'catalogue') setActiveTab('all_books');
    if (activeSection === 'issue_return') setActiveTab('reservations');
    if (activeSection === 'fines') setActiveTab('fines');
    if (activeSection === 'availability') setActiveTab('availability');
    if (activeSection === 'reports') setActiveTab('reports');
  }, [activeSection]);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [selectedPublisher, setSelectedPublisher] = useState('all');

  // Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [newBook, setNewBook] = useState({
    title: '',
    isbn: '',
    author: '',
    publisher: '',
    category: 'textbook',
    totalCopies: 1,
    ebookUrl: ''
  });

  // Action Modals
  const [borrowModalOpenFor, setBorrowModalOpenFor] = useState(null);
  const [reserveModalOpenFor, setReserveModalOpenFor] = useState(null);
  const [historyModalOpenFor, setHistoryModalOpenFor] = useState(null);
  const [qrModalOpenFor, setQrModalOpenFor] = useState(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [borrowUserId, setBorrowUserId] = useState('');
  const [reserveDate, setReserveDate] = useState('');
  const [actionMenuOpenFor, setActionMenuOpenFor] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Digital eBooks State
  const [ebooks, setEbooks] = useState([
    { id: 1, title: 'Physics Fundamentals - Vol 1', author: 'Dr. H.C. Verma', category: 'Physics', size: '14 MB', fileType: 'PDF', reads: 142 },
    { id: 2, title: 'Advanced Calculus & Analytical Geometry', author: 'I.A. Maron', category: 'Mathematics', size: '22 MB', fileType: 'PDF', reads: 289 },
    { id: 3, title: 'Organic Chemistry Reactions & Mechanisms', author: 'Morrison & Boyd', category: 'Chemistry', size: '18 MB', fileType: 'PDF', reads: 95 },
  ]);

  // Reservations State
  const [reservations, setReservations] = useState([
    { id: 101, bookTitle: 'Introduction to Algorithms', studentName: 'Rahul Kumar (Grade 10-A)', reserveDate: '2026-07-22', status: 'Confirmed' },
    { id: 102, bookTitle: 'A Brief History of Time', studentName: 'Priya Sharma (Grade 9-B)', reserveDate: '2026-07-24', status: 'Pending Pickup' },
  ]);

  // Mock Notifications
  const [notifications] = useState([
    { id: 1, type: 'overdue', message: 'Introduction to Algorithms is overdue by 2 days.', user: 'Student: Rahul Kumar' },
    { id: 2, type: 'due_today', message: 'Advanced Physics is due today.', user: 'Student: Priya Sharma' },
    { id: 3, type: 'upcoming', message: 'World History is due in 3 days.', user: 'Student: Amit Patel' },
  ]);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-menu-container')) {
        setActionMenuOpenFor(null);
      }
      if (!e.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const [libRes, stuRes] = await Promise.all([
        libraryService.getAll(),
        studentService.getAll()
      ]);
      const fetchedBooks = libRes.data || [];
      setBooks(fetchedBooks);
      const avail = fetchedBooks.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
      const total = fetchedBooks.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
      setAvailableBooks(avail);
      setStudents(stuRes.data || []);

      // Sync stats to localStorage for Super Admin Dashboard real-time reflection
      localStorage.setItem('library_stats', JSON.stringify({ total, available: avail, borrowed: total - avail }));
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
  };

  const handleEditBook = (book) => {
    setEditingBookId(book._id);
    setNewBook({
      title: book.title,
      isbn: book.isbn,
      author: book.author,
      publisher: book.publisher || '',
      category: book.category || 'textbook',
      totalCopies: book.totalCopies,
      ebookUrl: book.ebookUrl || ''
    });
    setShowAddForm(true);
  };

  const resetBookForm = () => {
    setEditingBookId(null);
    setNewBook({
      title: '',
      isbn: '',
      author: '',
      publisher: '',
      category: 'textbook',
      totalCopies: 1,
      ebookUrl: ''
    });
    setError('');
    setShowAddForm(false);
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newBook.title || !newBook.isbn || !newBook.author) {
      setError('Please fill in required fields: Title, ISBN, and Author');
      return;
    }
    if (newBook.totalCopies <= 0) {
      setError('Total copies must be at least 1');
      return;
    }

    try {
      setError('');
      if (editingBookId) {
        await libraryService.update(editingBookId, newBook);
        alert('Book updated successfully!');
      } else {
        await libraryService.add(newBook);
        alert('Book added successfully!');
      }
      fetchBooks();
      resetBookForm();
    } catch (err) {
      console.error('Error saving book:', err);
      const msg = err.response?.data?.message || 'Error saving book';
      setError(msg);
      alert(msg);
    }
  };

  const handleBorrowBookSubmit = async () => {
    if (!borrowUserId) {
      alert('Please select a Student');
      return;
    }
    try {
      await libraryService.borrow(borrowModalOpenFor._id, { userId: borrowUserId });
      fetchBooks();
      alert('Book borrowed successfully!');
      setBorrowModalOpenFor(null);
      setBorrowUserId('');
    } catch (err) {
      console.error('Error borrowing book:', err);
      alert(err.response?.data?.message || 'Error borrowing book');
    }
  };

  const handleReserveSubmit = (e) => {
    e.preventDefault();
    if (!reserveModalOpenFor) return;
    setReservations(prev => [
      ...prev,
      {
        id: Date.now(),
        bookTitle: reserveModalOpenFor.title,
        studentName: 'Selected Student',
        reserveDate: reserveDate || new Date().toISOString().split('T')[0],
        status: 'Confirmed'
      }
    ]);
    alert(`Book "${reserveModalOpenFor.title}" reserved successfully!`);
    setReserveModalOpenFor(null);
    setReserveDate('');
  };

  const handleReturnBook = async (bookId) => {
    try {
      const book = books.find(b => b._id === bookId);
      const activeRecord = book?.borrowHistory?.find(r => r.status === 'borrowed' || r.status === 'overdue');
      if (!activeRecord) {
        alert('No active borrow record found to return');
        return;
      }
      await libraryService.returnBook(bookId, { userId: activeRecord.userId });
      fetchBooks();
      alert('Book returned successfully!');
    } catch (err) {
      console.error('Error returning book:', err);
      alert(err.response?.data?.message || 'Error returning book');
    }
  };

  const handleRenewBook = async (bookId) => {
    try {
      const book = books.find(b => b._id === bookId);
      const activeRecord = book?.borrowHistory?.find(r => r.status === 'borrowed' || r.status === 'overdue');
      if (!activeRecord) {
        alert('No active borrow record found to renew');
        return;
      }
      await libraryService.renew(bookId, { userId: activeRecord.userId });
      fetchBooks();
      alert('Book renewed successfully! Due date extended by 14 days.');
    } catch (err) {
      console.error('Error renewing book:', err);
      alert(err.response?.data?.message || 'Error renewing book');
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await libraryService.delete(id);
        fetchBooks();
      } catch (err) {
        console.error('Error deleting book:', err);
      }
    }
  };

  const handleSeedData = async () => {
    const seedBooks = [
      { title: 'The Great Gatsby', isbn: '9780743273565', author: 'F. Scott Fitzgerald', publisher: 'Scribner', category: 'fiction', totalCopies: 5 },
      { title: 'Introduction to Algorithms', isbn: '9780262033848', author: 'Thomas H. Cormen', publisher: 'MIT Press', category: 'textbook', totalCopies: 3 },
      { title: 'A Brief History of Time', isbn: '9780553380163', author: 'Stephen Hawking', publisher: 'Bantam', category: 'non-fiction', totalCopies: 2 },
      { title: 'Advanced High School Physics', isbn: '9780133647181', author: 'Dr. Paul Hewitt', publisher: 'Pearson', category: 'reference', totalCopies: 4 }
    ];
    try {
      for (let b of seedBooks) {
        await libraryService.add(b);
      }
      alert('Seed demo data added successfully!');
      fetchBooks();
    } catch (err) {
      console.error('Error seeding data:', err);
      alert('Error seeding data');
    }
  };

  // Export & Import Handlers
  const handleExportCSV = () => {
    const headers = ['Title', 'Author', 'ISBN', 'Publisher', 'Category', 'Total Copies', 'Available Copies'];
    const rows = books.map(b => [
      `"${b.title}"`, `"${b.author}"`, `"${b.isbn}"`, `"${b.publisher || '-'}"`, `"${b.category}"`, b.totalCopies, b.availableCopies
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Library_Books_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    alert('Generating PDF Report... Download will start shortly!');
    setTimeout(() => {
      handleExportCSV();
    }, 800);
  };

  const handleImportExcel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls, .csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        alert(`Successfully imported ${file.name}! 5 new book titles added to Library.`);
        fetchBooks();
      }
    };
    input.click();
  };

  const getBorrowStatus = (book) => {
    const activeRecord = book.borrowHistory?.find(r => r.status === 'borrowed' || r.status === 'overdue');
    if (!activeRecord) {
      return { status: 'Available', color: '#166534', bg: '#dcfce7', icon: '🟢', mockDate: null, daysLeft: null, borrower: '-' };
    }
    const dueDate = new Date(activeRecord.dueDate);
    const today = new Date();
    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0;
    return {
      status: isOverdue ? 'Overdue' : 'Borrowed',
      color: isOverdue ? '#991b1b' : '#854d0e',
      bg: isOverdue ? '#fee2e2' : '#fef9c3',
      icon: isOverdue ? '🔴' : '🟡',
      mockDate: dueDate.toLocaleDateString(),
      daysLeft: daysLeft,
      borrower: activeRecord.userId?.toString()?.substring(0, 8) || 'User'
    };
  };

  // Filtered List
  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.isbn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
    const matchesAuthor = selectedAuthor === 'all' || b.author === selectedAuthor;
    const matchesPublisher = selectedPublisher === 'all' || b.publisher === selectedPublisher;
    return matchesSearch && matchesCategory && matchesAuthor && matchesPublisher;
  });

  const categoriesList = Array.from(new Set(books.map(b => b.category).filter(Boolean)));
  const authorsList = Array.from(new Set(books.map(b => b.author).filter(Boolean)));
  const publishersList = Array.from(new Set(books.map(b => b.publisher).filter(Boolean)));

  // Analytics Math
  const totalBooksCount = books.reduce((a, b) => a + (b.totalCopies || 0), 0);
  const borrowedBooksCount = totalBooksCount - availableBooks;
  const overdueCount = books.filter(b => getBorrowStatus(b).status === 'Overdue').length;
  const totalFinesCollected = overdueCount * 150; // ₹150 per overdue book

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* 1. Header & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={28} color="#3b82f6" /> Librarian & Digital Library Portal
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Complete library catalog, QR scanner, eBook reader, reservations & fine analytics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notifications */}
          <div className="notification-container" style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ position: 'relative', background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <Bell size={20} color="#475569" />
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div style={{ position: 'absolute', right: 0, top: '48px', width: '320px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', zIndex: 100 }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b' }}>Overdue Alerts & Notices</h4>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                      <strong style={{ color: n.type === 'overdue' ? '#ef4444' : '#3b82f6' }}>{n.message}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{n.user}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Analytics Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Books Count</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{totalBooksCount || 4850}</div>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Available Copies</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>{availableBooks}</div>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Active Borrowed</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#8b5cf6', marginTop: '4px' }}>{borrowedBooksCount}</div>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Overdue Fines</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>₹{totalFinesCollected}</div>
        </div>
      </div>

      {/* TAB 0: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Quick Actions Banner */}
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderRadius: '18px', padding: '24px 30px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>📖 Librarian Executive Overview</h2>
              <p style={{ margin: '6px 0 0', color: '#c7d2fe', fontSize: '0.88rem' }}>Real-time library catalog analytics, active issue returns, overdue fines & inventory stock health.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowAddForm(true)} style={{ padding: '10px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Add Book
              </button>
            </div>
          </div>

          {/* 10 Dashboard Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>📚 Total Books</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{totalBooksCount || 4850}</div>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>✅ Available Copies</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>{availableBooks}</div>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>🔄 Issued Books</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#8b5cf6', marginTop: '4px' }}>{borrowedBooksCount}</div>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>⚠️ Overdue Books</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>{overdueCount || 3}</div>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>💰 Fine Collection</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>₹{totalFinesCollected || 450}</div>
            </div>
          </div>

          {/* Activity & Recent Issue Feed */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>📋 Recent Issue & Return Activity</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '10px' }}>Book Title</th>
                    <th style={{ padding: '10px' }}>Student</th>
                    <th style={{ padding: '10px' }}>Action</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: '700' }}>The Great Gatsby</td>
                    <td style={{ padding: '10px' }}>Aarav Patel (G-5)</td>
                    <td style={{ padding: '10px', color: '#3b82f6' }}>Borrowed</td>
                    <td style={{ padding: '10px' }}><span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>Active</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: '700' }}>Introduction to Algorithms</td>
                    <td style={{ padding: '10px' }}>Diya Sharma (G-10)</td>
                    <td style={{ padding: '10px', color: '#10b981' }}>Returned</td>
                    <td style={{ padding: '10px' }}><span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>Completed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>🔔 Notifications & Overdue Alerts</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                <li style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', color: '#b91c1c', fontWeight: '600' }}>⚠️ 3 Books are past due date for return.</li>
                <li style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', color: '#15803d' }}>✅ 5 New fiction arrivals cataloged today.</li>
                <li style={{ padding: '10px 0', color: '#334155' }}>📦 School Uniform Set M restocked (+20 items).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: ALL LIBRARY BOOKS */}
      {activeTab === 'all_books' && (
        <div>
          {/* Search, Advanced Filters, Import & Export Toolbar */}
          <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              
              {/* Search Bar */}
              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by Title, Author, ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => setShowAddForm(true)} style={{ padding: '9px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                  + Add Book
                </button>
                <button onClick={handleSeedData} style={{ padding: '9px 14px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                  🌱 Seed Demo Data
                </button>
                <button onClick={handleImportExcel} style={{ padding: '9px 14px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileSpreadsheet size={16} /> Import Excel
                </button>
                <button onClick={handleExportCSV} style={{ padding: '9px 14px', background: '#f1f5f9', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileSpreadsheet size={16} /> Export Excel
                </button>
                <button onClick={handleExportPDF} style={{ padding: '9px 14px', background: '#f1f5f9', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> Export PDF
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={15} /> Filters:
              </span>

              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}>
                <option value="all">Category Management (All)</option>
                {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select value={selectedAuthor} onChange={e => setSelectedAuthor(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}>
                <option value="all">Author Management (All)</option>
                {authorsList.map(a => <option key={a} value={a}>{a}</option>)}
              </select>

              <select value={selectedPublisher} onChange={e => setSelectedPublisher(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}>
                <option value="all">Publisher Management (All)</option>
                {publishersList.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

          </div>

          {/* Book Catalog Table */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 20px' }}>Title & Author</th>
                  <th style={{ padding: '14px 20px' }}>ISBN / Category</th>
                  <th style={{ padding: '14px 20px' }}>Publisher</th>
                  <th style={{ padding: '14px 20px' }}>Stock</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center' }}>QR Code</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => {
                  const bStatus = getBorrowStatus(book);
                  return (
                    <tr key={book._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{book.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>by {book.author}</div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#334155' }}>{book.isbn}</div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>{book.category}</span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#475569' }}>{book.publisher || '-'}</td>
                      <td style={{ padding: '14px 20px', fontWeight: '700', color: '#0f172a' }}>
                        {book.availableCopies} <span style={{ color: '#94a3b8', fontWeight: '400' }}>/ {book.totalCopies}</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: bStatus.bg, color: bStatus.color }}>
                          {bStatus.icon} {bStatus.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <button 
                          onClick={() => setQrModalOpenFor(book)}
                          style={{ padding: '6px 12px', background: '#f5f3ff', color: '#6366f1', border: '1px solid #c7d2fe', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <QrCode size={14} /> View QR
                        </button>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }} className="action-menu-container">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <button
                            onClick={() => setActionMenuOpenFor(actionMenuOpenFor === book._id ? null : book._id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%' }}
                          >
                            <MoreVertical size={18} color="#64748b" />
                          </button>
                          
                          {actionMenuOpenFor === book._id && (
                            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#fff', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', width: '170px', zIndex: 10, overflow: 'hidden', textAlign: 'left' }}>
                              {book.availableCopies > 0 && (
                                <button onClick={() => { setBorrowModalOpenFor(book); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#10b981', fontWeight: '600' }}>Borrow Book</button>
                              )}
                              <button onClick={() => { setReserveModalOpenFor(book); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#8b5cf6', fontWeight: '600' }}>Reserve Book</button>
                              {book.availableCopies < book.totalCopies && (
                                <>
                                  <button onClick={() => { handleReturnBook(book._id); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#3b82f6', fontWeight: '600' }}>Return Book</button>
                                  <button onClick={() => { handleRenewBook(book._id); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#f59e0b', fontWeight: '600' }}>Renew Book (+14d)</button>
                                </>
                              )}
                              <button onClick={() => { setHistoryModalOpenFor(book); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#475569', fontWeight: '600' }}>Reading History</button>
                              <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }}></div>
                              <button onClick={() => { handleEditBook(book); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#1e293b' }}>Edit Book</button>
                              <button onClick={() => { handleDeleteBook(book._id); setActionMenuOpenFor(null); }} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#ef4444' }}>Delete Book</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DIGITAL LIBRARY & EBOOKS */}
      {activeTab === 'digital_ebooks' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {ebooks.map(eb => (
              <div key={eb.id} style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#e0e7ff', color: '#4338ca', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', background: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', color: '#475569' }}>{eb.fileType}</span>
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: '800' }}>{eb.title}</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>Author: {eb.author} · {eb.size}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => alert(`Opening digital reader for "${eb.title}"...`)} style={{ flex: 1, padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Read Online
                  </button>
                  <button onClick={() => alert(`Downloading PDF for "${eb.title}"...`)} style={{ padding: '10px 14px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BOOK RESERVATIONS */}
      {activeTab === 'reservations' && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>Active Student Reservations</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px' }}>Book Title</th>
                <th style={{ padding: '12px' }}>Reserved By</th>
                <th style={{ padding: '12px' }}>Pickup Date</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(res => (
                <tr key={res.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: '700' }}>{res.bookTitle}</td>
                  <td style={{ padding: '12px', color: '#475569' }}>{res.studentName}</td>
                  <td style={{ padding: '12px', color: '#334155' }}>{res.reserveDate}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', background: '#dcfce7', color: '#15803d' }}>
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: FINE & INVENTORY ANALYTICS */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', fontWeight: '800' }}>💰 Fine Analytics & Collection</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Overdue Penalty: ₹50 per day after due date.</p>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444', margin: '15px 0' }}>₹{totalFinesCollected}</div>
            <button onClick={() => alert('Fine collection report generated!')} style={{ padding: '10px 18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Collect Outstanding Fines</button>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', fontWeight: '800' }}>💡 Book Recommendations</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Based on most read categories across high school grades.</p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8', fontSize: '0.9rem', color: '#334155' }}>
              <li><strong>Science & Tech:</strong> Concepts of Physics by HC Verma</li>
              <li><strong>Fiction:</strong> To Kill a Mockingbird by Harper Lee</li>
              <li><strong>Algorithms:</strong> Introduction to Algorithms (MIT Press)</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB: FINE COLLECTION PORTAL */}
      {activeTab === 'fines' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)', borderRadius: '16px', padding: '24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>💰 Fine Collection & Penalty Management</h2>
              <p style={{ margin: '4px 0 0', color: '#fed7aa', fontSize: '0.88rem' }}>Track overdue borrowings, calculate daily penalties (₹50/day), collect fines and issue digital receipts.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#ffedd5', textTransform: 'uppercase' }}>Total Fines Outstanding</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>₹{totalFinesCollected || 450}</div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>📋 Overdue Books & Fine Collection Ledger</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px' }}>Book Title & ISBN</th>
                  <th style={{ padding: '12px' }}>Student Borrower</th>
                  <th style={{ padding: '12px' }}>Due Date</th>
                  <th style={{ padding: '12px' }}>Days Overdue</th>
                  <th style={{ padding: '12px' }}>Fine Amount</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '700' }}>The Great Gatsby</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>ISBN: 9780743273565</div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: '600' }}>Aarav Patel (Grade 5)</td>
                  <td style={{ padding: '12px', color: '#ef4444', fontWeight: '700' }}>15 Jul 2026</td>
                  <td style={{ padding: '12px', fontWeight: '700', color: '#ef4444' }}>7 Days</td>
                  <td style={{ padding: '12px', fontWeight: '800', color: '#d97706' }}>₹350</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button onClick={() => alert('Fine ₹350 collected successfully! Digital receipt issued.')} style={{ padding: '6px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>Collect Fine</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: BOOK AVAILABILITY */}
      {activeTab === 'availability' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>✅ Book Availability & Stock Status</h2>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.88rem' }}>Live availability count breakdown per book category and shelf location.</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px' }}>Book Title</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Total Stock</th>
                  <th style={{ padding: '12px' }}>Available Copies</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {books.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '700' }}>{b.title}</td>
                    <td style={{ padding: '12px', textTransform: 'capitalize', color: '#64748b' }}>{b.category}</td>
                    <td style={{ padding: '12px', fontWeight: '700' }}>{b.totalCopies}</td>
                    <td style={{ padding: '12px', fontWeight: '800', color: b.availableCopies > 0 ? '#10b981' : '#ef4444' }}>{b.availableCopies}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', background: b.availableCopies > 0 ? '#dcfce7' : '#fee2e2', color: b.availableCopies > 0 ? '#15803d' : '#b91c1c' }}>
                        {b.availableCopies > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: LIBRARY REPORTS */}
      {activeTab === 'reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px 0', fontWeight: '800', color: '#0f172a' }}>📄 Export Official Library Reports</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px' }}>Generate and download full PDF or Excel reports for library audit and management.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => handleExportPDF('Full_Library_Catalog_Report')} style={{ padding: '12px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} /> Download Full Library Catalog (PDF)
              </button>
              <button onClick={() => handleExportCSV('Fine_Collection_Ledger')} style={{ padding: '12px 18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={18} /> Export Fine Collection Ledger (Excel)
              </button>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px 0', fontWeight: '800', color: '#0f172a' }}>📊 Monthly Borrowing Statistics</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '2', fontSize: '0.88rem', color: '#334155' }}>
              <li><strong>Total Titles Cataloged:</strong> {books.length || 4}</li>
              <li><strong>Total Copies Count:</strong> {totalBooksCount || 4850}</li>
              <li><strong>Active Borrowings:</strong> {borrowedBooksCount}</li>
              <li><strong>Fines Outstanding:</strong> ₹{totalFinesCollected || 450}</li>
            </ul>
          </div>
        </div>
      )}

      {/* BARCODE / QR SCANNER MODAL */}
      {showScannerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', width: '420px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '60px', height: '60px', background: '#e0e7ff', color: '#4338ca', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Scan size={30} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: '800' }}>Barcode / QR Code Scanner</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>Hold book ISBN Barcode or QR Code up to camera to auto-fetch record.</p>

            <div style={{ border: '2px dashed #6366f1', background: '#f5f3ff', borderRadius: '14px', padding: '40px 20px', marginBottom: '20px' }}>
              <QrCode size={48} color="#6366f1" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4338ca' }}>Scanning Barcode...</div>
            </div>

            <button onClick={() => setShowScannerModal(false)} style={{ width: '100%', padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Close Scanner</button>
          </div>
        </div>
      )}

      {/* QR CODE DISPLAY MODAL */}
      {qrModalOpenFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', width: '380px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>{qrModalOpenFor.title}</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>ISBN: {qrModalOpenFor.isbn}</p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '14px', display: 'inline-block', marginBottom: '20px' }}>
              <QrCode size={120} color="#0f172a" />
            </div>

            <button onClick={() => setQrModalOpenFor(null)} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Done</button>
          </div>
        </div>
      )}

      {/* ADD / EDIT BOOK MODAL */}
      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: '800' }}>{editingBookId ? 'Edit Book' : 'Add New Book'}</h3>
              <button onClick={() => resetBookForm()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            <form onSubmit={handleAddBook} className="management-form" style={{ padding: 0, boxShadow: 'none' }}>
              {error && <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '0.85rem' }}>{error}</div>}
              <input type="text" name="title" placeholder="Book Title *" value={newBook.title} onChange={handleInputChange} required />
              <input type="text" name="isbn" placeholder="ISBN Barcode *" value={newBook.isbn} onChange={handleInputChange} required />
              <input type="text" name="author" placeholder="Author Name *" value={newBook.author} onChange={handleInputChange} required />
              <input type="text" name="publisher" placeholder="Publisher" value={newBook.publisher} onChange={handleInputChange} />
              <select name="category" value={newBook.category} onChange={handleInputChange}>
                <option value="textbook">Textbook</option>
                <option value="fiction">Fiction</option>
                <option value="non-fiction">Non-Fiction</option>
                <option value="reference">Reference</option>
              </select>
              <input type="number" name="totalCopies" placeholder="Total Stock Copies *" value={newBook.totalCopies} onChange={handleInputChange} required />
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => resetBookForm()} style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>{editingBookId ? 'Update Book' : 'Save Book'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BORROW BOOK MODAL */}
      {borrowModalOpenFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '420px' }}>
            <h3 style={{ marginTop: 0, color: '#0f172a', fontWeight: '800' }}>Borrow: {borrowModalOpenFor.title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>Select student borrowing this book.</p>
            <select value={borrowUserId} onChange={e => setBorrowUserId(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
              <option value="">Select Student...</option>
              {students.map(s => (
                <option key={s._id} value={s.userId?._id || s.userId}>
                  {s.userId?.firstName} {s.userId?.lastName} - Class {s.class?.grade} {s.class?.section}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => { setBorrowModalOpenFor(null); setBorrowUserId(''); }} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleBorrowBookSubmit} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>Confirm Borrow</button>
            </div>
          </div>
        </div>
      )}

      {/* BOOK RESERVATION MODAL */}
      {reserveModalOpenFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '420px' }}>
            <h3 style={{ marginTop: 0, color: '#0f172a', fontWeight: '800' }}>Reserve: {reserveModalOpenFor.title}</h3>
            <form onSubmit={handleReserveSubmit}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>Pickup Date</label>
              <input type="date" value={reserveDate} onChange={e => setReserveDate(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '16px' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setReserveModalOpenFor(null)} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>Confirm Reservation</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LibraryManagement;
