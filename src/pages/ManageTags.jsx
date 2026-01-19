import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import Modal, { ConfirmModal } from '../components/Modal';
import IconPicker, { suggestIconForText } from '../components/IconPicker';

const ManageTags = () => {
  const navigate = useNavigate();
  const { tags, addTag, updateTag, deleteTag } = useExpense();
  
  const [activeCategory, setActiveCategory] = useState('payees');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagIcon, setNewTagIcon] = useState('📦');
  const [iconManuallySet, setIconManuallySet] = useState(false);
  const [editingTag, setEditingTag] = useState({ originalName: '', newName: '', originalIcon: '', newIcon: '' });
  const [deletingTag, setDeletingTag] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showEditIconPicker, setShowEditIconPicker] = useState(false);

  // Auto-suggest icon based on tag name
  useEffect(() => {
    if (newTagName && !iconManuallySet) {
      const suggestedIcon = suggestIconForText(newTagName);
      setNewTagIcon(suggestedIcon);
    }
  }, [newTagName, iconManuallySet]);

  const categoryLabels = {
    payees: { label: 'Payees', icon: '👤' },
    categories: { label: 'Categories', icon: '📁' },
    paymentMethods: { label: 'Payment Methods', icon: '💳' },
    statuses: { label: 'Statuses', icon: '📊' }
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      addTag(activeCategory, newTagName.trim(), newTagIcon);
      setNewTagName('');
      setNewTagIcon('📦');
      setIconManuallySet(false);
      setShowAddModal(false);
      setShowIconPicker(false);
    }
  };

  const handleUpdateTag = () => {
    if (editingTag.newName.trim()) {
      updateTag(activeCategory, editingTag.originalName, editingTag.newName.trim(), editingTag.newIcon);
      setEditingTag({ originalName: '', newName: '', originalIcon: '', newIcon: '' });
      setShowEditModal(false);
      setShowEditIconPicker(false);
    }
  };

  const handleDeleteTag = () => {
    if (deletingTag) {
      deleteTag(activeCategory, deletingTag);
      setDeletingTag('');
      setShowDeleteModal(false);
    }
  };

  const openEditModal = (tag) => {
    setEditingTag({ 
      originalName: tag.name, 
      newName: tag.name, 
      originalIcon: tag.icon, 
      newIcon: tag.icon 
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (tag) => {
    setDeletingTag(tag.name);
    setShowDeleteModal(true);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">Manage Tags</h1>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto pb-2 mb-4 -mx-4 px-4 gap-2 scrollbar-hide">
        {Object.entries(categoryLabels).map(([key, { label, icon }]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeCategory === key
                ? 'bg-primary-600 text-white shadow'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{icon}</span>
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Tags List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {categoryLabels[activeCategory].icon} {categoryLabels[activeCategory].label}
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {tags[activeCategory].length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No tags in this category</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 text-primary-600 font-medium"
              >
                Add your first tag
              </button>
            </div>
          ) : (
            tags[activeCategory].map((tag, index) => (
              <div
                key={`${tag.name}-${index}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tag.icon}</span>
                  <span className="text-gray-900">{tag.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(tag)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openDeleteModal(tag)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-4 p-4 bg-blue-50 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Tip</h3>
            <p className="text-sm text-blue-700">
              Tags help you organize your transactions. You can also add new tags directly when adding or editing a transaction.
            </p>
          </div>
        </div>
      </div>

      {/* Add Tag Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewTagName('');
          setNewTagIcon('📦');
          setIconManuallySet(false);
          setShowIconPicker(false);
        }}
        title={`Add New ${categoryLabels[activeCategory].label.slice(0, -1)}`}
      >
        {/* Tag Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter tag name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            autoFocus
          />
        </div>

        {/* Icon Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
          <button
            type="button"
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors"
          >
            <span className="text-2xl">{newTagIcon}</span>
            <span className="text-gray-600">Tap to select icon</span>
            <svg className={`w-5 h-5 text-gray-400 ml-auto transition-transform ${showIconPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showIconPicker && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl">
              <IconPicker
                selectedIcon={newTagIcon}
                onSelect={(icon) => {
                  setNewTagIcon(icon);
                  setIconManuallySet(true);
                  setShowIconPicker(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 mb-2">Preview:</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{newTagIcon}</span>
            <span className="font-medium text-gray-900">{newTagName || 'Tag Name'}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowAddModal(false);
              setNewTagName('');
              setNewTagIcon('📦');
              setIconManuallySet(false);
              setShowIconPicker(false);
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddTag}
            className="flex-1 py-2.5 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
          >
            Add Tag
          </button>
        </div>
      </Modal>

      {/* Edit Tag Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTag({ originalName: '', newName: '', originalIcon: '', newIcon: '' });
          setShowEditIconPicker(false);
        }}
        title="Edit Tag"
      >
        {/* Tag Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-gray-400">(was: {editingTag.originalName})</span>
          </label>
          <input
            type="text"
            value={editingTag.newName}
            onChange={(e) => setEditingTag(prev => ({ ...prev, newName: e.target.value }))}
            placeholder="Enter new name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            autoFocus
          />
        </div>

        {/* Icon Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
          <button
            type="button"
            onClick={() => setShowEditIconPicker(!showEditIconPicker)}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors"
          >
            <span className="text-2xl">{editingTag.newIcon}</span>
            <span className="text-gray-600">Tap to change icon</span>
            <svg className={`w-5 h-5 text-gray-400 ml-auto transition-transform ${showEditIconPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showEditIconPicker && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl">
              <IconPicker
                selectedIcon={editingTag.newIcon}
                onSelect={(icon) => {
                  setEditingTag(prev => ({ ...prev, newIcon: icon }));
                  setShowEditIconPicker(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 mb-2">Preview:</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{editingTag.newIcon}</span>
            <span className="font-medium text-gray-900">{editingTag.newName || 'Tag Name'}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Note: Changing the name will update all transactions using this tag.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowEditModal(false);
              setEditingTag({ originalName: '', newName: '', originalIcon: '', newIcon: '' });
              setShowEditIconPicker(false);
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateTag}
            className="flex-1 py-2.5 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
          >
            Update
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingTag('');
        }}
        onConfirm={handleDeleteTag}
        title="Delete Tag"
        message={`Are you sure you want to delete "${deletingTag}"? This will not affect existing transactions.`}
      />
    </div>
  );
};

export default ManageTags;
