'use client';

import { useEffect, useState } from 'react';
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api-client';
import {
  Folder,
  FolderPlus,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  Edit2,
  Move,
  Image as ImageIcon,
  AlertCircle,
  X,
  Check
} from 'lucide-react';

interface Folder {
  id: string;
  name: string;
  count: number;
  createdAt: string;
}

interface Wallpaper {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  folderId: string;
  tags: string[];
  is_public: boolean;
  createdAt: string;
}

export default function AdminWallpapersPage() {
  const { t } = useLanguage();

  // 文件夹相关
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  // 壁纸相关
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 操作菜单
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [wallpaperToMove, setWallpaperToMove] = useState<Wallpaper | null>(null);

  // 上传相关状态
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [uploadIsPublic, setUploadIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const availableTags = ['nsfw', 'sfw', 'anime', 'realistic', 'abstract', 'landscape', 'portrait', 'nature'];

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      loadWallpapers();
    }
  }, [selectedFolder]);

  // 加载文件夹列表
  const loadFolders = async () => {
    try {
      const res: any = await api.admin.getFolders();
      const folderData = res?.data?.folders || res?.folders || [];
      setFolders(folderData);
      if (folderData.length > 0 && !selectedFolder) {
        setSelectedFolder(folderData[0].id);
      }
    } catch (e: any) {
      console.error('加载文件夹失败:', e);
      setError(e.message || '加载文件夹失败');
    }
  };

  // 加载壁纸列表
  const loadWallpapers = async () => {
    if (!selectedFolder) return;
    setLoading(true);
    setError('');
    try {
      const res: any = await api.admin.getWallpapersByFolder(selectedFolder);
      const wallpaperData = res?.data?.wallpapers || res?.wallpapers || [];
      setWallpapers(wallpaperData);
    } catch (e: any) {
      console.error('加载壁纸失败:', e);
      setError(e.message || '加载壁纸失败');
      setWallpapers([]);
    } finally {
      setLoading(false);
    }
  };

  // 创建文件夹
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await api.admin.createFolder({ name: newFolderName.trim() });
      setShowNewFolderModal(false);
      setNewFolderName('');
      await loadFolders();
    } catch (e: any) {
      alert('创建文件夹失败: ' + e.message);
    }
  };

  // 重命名文件夹
  const handleRenameFolder = async (folder: Folder, newName: string) => {
    if (!newName.trim() || newName === folder.name) {
      setEditingFolder(null);
      return;
    }
    try {
      await api.admin.updateFolder(folder.id, { name: newName.trim() });
      setEditingFolder(null);
      await loadFolders();
    } catch (e: any) {
      alert('重命名失败: ' + e.message);
    }
  };

  // 删除文件夹
  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('确定要删除此文件夹吗？文件夹中的壁纸也将被删除。')) return;
    try {
      await api.admin.deleteFolder(folderId);
      if (selectedFolder === folderId) {
        setSelectedFolder(folders[0]?.id || null);
      }
      await loadFolders();
    } catch (e: any) {
      alert('删除文件夹失败: ' + e.message);
    }
  };

  // 删除壁纸
  const handleDeleteWallpaper = async (wallpaperId: string) => {
    if (!confirm('确定要删除这张壁纸吗？')) return;
    try {
      await api.admin.deleteWallpaper(wallpaperId);
      await loadWallpapers();
      await loadFolders(); // 更新文件夹计数
      setActiveMenu(null);
    } catch (e: any) {
      alert('删除壁纸失败: ' + e.message);
    }
  };

  // 切换壁纸可见性
  const handleToggleVisibility = async (wallpaper: Wallpaper) => {
    try {
      await api.admin.updateWallpaper(wallpaper.id, {
        is_public: !wallpaper.is_public
      });
      await loadWallpapers();
      setActiveMenu(null);
    } catch (e: any) {
      alert('更新失败: ' + e.message);
    }
  };

  // 移动壁纸
  const handleMoveWallpaper = async (targetFolderId: string) => {
    if (!wallpaperToMove) return;
    try {
      await api.admin.moveWallpapers([wallpaperToMove.id], targetFolderId);
      setShowMoveModal(false);
      setWallpaperToMove(null);
      await loadWallpapers();
      await loadFolders(); // 更新文件夹计数
    } catch (e: any) {
      alert('移动失败: ' + e.message);
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  // 添加文件
  const addFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('请选择图片文件');
      return;
    }

    setUploadFiles(prev => [...prev, ...imageFiles]);

    // 生成预览
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 拖拽处理
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  // 移除文件
  const handleRemoveFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
    setUploadPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 切换标签
  const toggleTag = (tag: string) => {
    setUploadTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // 执行上传
  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      alert('请选择要上传的文件');
      return;
    }

    if (!selectedFolder) {
      alert('请先选择文件夹');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      uploadFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('folderId', selectedFolder);
      formData.append('tags', uploadTags.join(','));
      formData.append('is_public', uploadIsPublic.toString());

      await api.admin.uploadWallpaper(formData);

      // 重置状态
      setUploadFiles([]);
      setUploadPreviews([]);
      setUploadTags([]);
      setShowUploadModal(false);

      // 刷新列表
      await loadWallpapers();
      await loadFolders();

      alert(`成功上传 ${uploadFiles.length} 张壁纸`);
    } catch (e: any) {
      alert('上传失败: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const selectedFolderData = folders.find(f => f.id === selectedFolder);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="flex h-screen">
        {/* 左侧文件夹列表 */}
        <div className="w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col">
          {/* 头部 */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
              文件夹管理
            </h2>
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              <FolderPlus className="h-4 w-4" />
              新建文件夹
            </button>
          </div>

          {/* 文件夹列表 */}
          <div className="flex-1 overflow-y-auto p-2">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={`group mb-1 rounded-lg transition-colors ${
                  selectedFolder === folder.id
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                {editingFolder?.id === folder.id ? (
                  <div className="p-2">
                    <input
                      type="text"
                      defaultValue={folder.name}
                      autoFocus
                      onBlur={(e) => handleRenameFolder(folder, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenameFolder(folder, e.currentTarget.value);
                        } else if (e.key === 'Escape') {
                          setEditingFolder(null);
                        }
                      }}
                      className="w-full px-2 py-1 text-sm border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => setSelectedFolder(folder.id)}
                    className="flex items-center justify-between p-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Folder className={`h-4 w-4 flex-shrink-0 ${
                        selectedFolder === folder.id
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`} />
                      <span className={`text-sm truncate ${
                        selectedFolder === folder.id
                          ? 'font-medium text-primary-700 dark:text-primary-300'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {folder.name}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        ({folder.count})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFolder(folder);
                        }}
                        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded"
                      >
                        <Edit2 className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
                      </button>
                      {folders.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 右侧壁纸展示区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部栏 */}
          <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {selectedFolderData?.name || '壁纸管理'}
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  共 {wallpapers.length} 张壁纸
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                disabled={!selectedFolder}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4" />
                上传壁纸
              </button>
            </div>
          </div>

          {/* 内容区 */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-neutral-600 dark:text-neutral-400">加载中...</span>
              </div>
            ) : wallpapers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-neutral-500 dark:text-neutral-400">
                <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">此文件夹暂无壁纸</p>
                <p className="text-sm mt-2">点击右上角上传按钮添加壁纸</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {wallpapers.map((wallpaper) => (
                  <div
                    key={wallpaper.id}
                    className="group relative bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    {/* 图片 */}
                    <div className="aspect-[3/4] relative overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                      <img
                        src={wallpaper.thumbnailUrl || wallpaper.imageUrl}
                        alt={wallpaper.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* 可见性标识 */}
                      <div className="absolute top-2 left-2">
                        {wallpaper.is_public ? (
                          <div className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            公开
                          </div>
                        ) : (
                          <div className="px-2 py-1 bg-neutral-500 text-white text-xs rounded-full flex items-center gap-1">
                            <EyeOff className="h-3 w-3" />
                            隐藏
                          </div>
                        )}
                      </div>

                      {/* 操作菜单按钮 */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setActiveMenu(activeMenu === wallpaper.id ? null : wallpaper.id)}
                          className="p-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-colors"
                        >
                          <MoreVertical className="h-4 w-4 text-white" />
                        </button>

                        {/* 下拉菜单 */}
                        {activeMenu === wallpaper.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden z-10">
                            <button
                              onClick={() => handleToggleVisibility(wallpaper)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                            >
                              {wallpaper.is_public ? (
                                <>
                                  <EyeOff className="h-4 w-4" />
                                  隐藏
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4" />
                                  公开
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setWallpaperToMove(wallpaper);
                                setShowMoveModal(true);
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                            >
                              <Move className="h-4 w-4" />
                              移动
                            </button>
                            <button
                              onClick={() => handleDeleteWallpaper(wallpaper.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                              删除
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 信息栏 */}
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-white truncate mb-1">
                        {wallpaper.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                        <span>{wallpaper.width} × {wallpaper.height}</span>
                      </div>
                      {wallpaper.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {wallpaper.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                tag.toLowerCase() === 'nsfw'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                  : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 新建文件夹模态框 */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              新建文件夹
            </h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="输入文件夹名称"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 移动壁纸模态框 */}
      {showMoveModal && wallpaperToMove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              移动壁纸到
            </h3>
            <div className="space-y-2 mb-4">
              {folders.filter(f => f.id !== selectedFolder).map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleMoveWallpaper(folder.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-left"
                >
                  <Folder className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  <span className="text-neutral-900 dark:text-white">{folder.name}</span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-auto">
                    ({folder.count})
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowMoveModal(false);
                setWallpaperToMove(null);
              }}
              className="w-full px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 上传壁纸模态框 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  上传壁纸到「{selectedFolderData?.name}」
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  支持拖拽上传，可选择多个文件
                </p>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFiles([]);
                  setUploadPreviews([]);
                  setUploadTags([]);
                }}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* 上传区域 */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
                <p className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                  拖拽文件到这里，或
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 dark:text-primary-400 hover:underline ml-1"
                  >
                    点击选择
                  </button>
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  支持 JPG、PNG、GIF、WEBP 等图片格式
                </p>
              </div>

              {/* 文件预览列表 */}
              {uploadFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                    已选择 {uploadFiles.length} 个文件
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={uploadFiles[index].name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 truncate">
                          {uploadFiles[index].name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 标签选择 */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                  选择标签（可选）
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                        uploadTags.includes(tag)
                          ? tag === 'nsfw'
                            ? 'bg-red-500 text-white'
                            : 'bg-primary-500 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 可见性设置 */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                  可见性设置
                </h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadIsPublic}
                    onChange={(e) => setUploadIsPublic(e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    在前端素材页面公开显示（不勾选则仅在后台可见）
                  </span>
                </label>
              </div>
            </div>

            {/* 底部操作栏 */}
            <div className="flex items-center justify-between p-6 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {uploadFiles.length > 0 ? `准备上传 ${uploadFiles.length} 张壁纸` : '还没有选择文件'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFiles([]);
                    setUploadPreviews([]);
                    setUploadTags([]);
                  }}
                  className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || uploadFiles.length === 0}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      上传中...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      开始上传
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
