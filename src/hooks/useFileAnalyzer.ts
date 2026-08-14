import { useState } from 'react';
import { SelectedFileItem } from '../types/billing';
import { parsePdfPages, parseDocxPages } from '../utils/fileParser';

export function useFileAnalyzer() {
  const [fileItems, setFileItems] = useState<SelectedFileItem[]>([]);

  const addFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Create initial loading items
    const newItems: SelectedFileItem[] = fileArray.map((file, idx) => ({
      id: `file-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      pageCount: 1,
      copies: 1,
      loading: true,
      error: null,
    }));

    setFileItems((prev) => [...prev, ...newItems]);

    // Analyze each file asynchronously
    for (const item of newItems) {
      if (!item.file) continue;
      const ext = item.fileName.split('.').pop()?.toLowerCase();

      try {
        let pages = 1;
        if (ext === 'pdf') {
          pages = await parsePdfPages(item.file);
        } else if (ext === 'docx' || ext === 'doc') {
          pages = await parseDocxPages(item.file);
        } else {
          throw new Error('Định dạng không hỗ trợ (.pdf, .docx)');
        }

        setFileItems((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, pageCount: Math.max(1, pages), loading: false, error: null }
              : f
          )
        );
      } catch (err: any) {
        console.error('Error analyzing file:', item.fileName, err);
        setFileItems((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  pageCount: 1,
                  loading: false,
                  error: err?.message || 'Lỗi đọc file, vui lòng nhập số trang thủ công.',
                }
              : f
          )
        );
      }
    }
  };

  const updateFilePageCount = (id: string, pages: number) => {
    setFileItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, pageCount: Math.max(1, pages) } : item
      )
    );
  };

  const updateFileCopies = (id: string, copies: number) => {
    setFileItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, copies: Math.max(1, copies) } : item
      )
    );
  };

  const addManualItem = (customName?: string) => {
    setFileItems((prev) => {
      const manualCount = prev.filter((f) => f.isManual).length + 1;
      const name = customName || `Tài liệu nhập tay ${manualCount}`;
      const newItem: SelectedFileItem = {
        id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        file: null,
        fileName: name,
        fileSize: 0,
        pageCount: 1,
        copies: 1,
        loading: false,
        error: null,
        isManual: true,
      };
      return [...prev, newItem];
    });
  };

  const updateFileName = (id: string, name: string) => {
    setFileItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, fileName: name } : item))
    );
  };

  const removeFileItem = (id: string) => {
    setFileItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllFiles = () => {
    setFileItems([]);
  };

  return {
    fileItems,
    addFiles,
    addManualItem,
    updateFileName,
    updateFilePageCount,
    updateFileCopies,
    removeFileItem,
    clearAllFiles,
  };
}
