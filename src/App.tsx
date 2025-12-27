import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'

interface EnvVars {
  [key: string]: string
}

interface PathEntry {
  path: string
  valid: boolean
  has_variable: boolean
}

interface OptimizationSuggestion {
  suggestion_type: string
  var_name: string
  var_value: string
  old_path: string
  new_path: string
  description: string
}

type View = 'variables' | 'path' | 'backup' | 'optimizer'

function App() {
  const [view, setView] = useState<View>('variables')
  const [userVars, setUserVars] = useState<EnvVars>({})
  const [systemVars, setSystemVars] = useState<EnvVars>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editModal, setEditModal] = useState<{ name: string; value: string; type: 'user' | 'system' } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pathEntries, setPathEntries] = useState<PathEntry[]>([])
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [backups, setBackups] = useState<string[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    loadVariables()
  }, [])

  const loadVariables = async () => {
    try {
      setLoading(true)
      const [user, system] = await Promise.all([
        invoke<EnvVars>('get_user_variables'),
        invoke<EnvVars>('get_system_variables'),
      ])
      setUserVars(user)
      setSystemVars(system)
      setError(null)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editModal) return
    try {
      if (editModal.type === 'user') {
        await invoke('set_user_variable', { name: editModal.name, value: editModal.value })
      } else {
        await invoke('set_system_variable', { name: editModal.name, value: editModal.value })
      }
      await loadVariables()
      setEditModal(null)
    } catch (e) {
      setError(String(e))
    }
  }

  const handleDelete = async (name: string, type: 'user' | 'system') => {
    if (!confirm(`确定要删除变量 "${name}" 吗？`)) return
    try {
      if (type === 'user') {
        await invoke('delete_user_variable', { name })
      } else {
        await invoke('delete_system_variable', { name })
      }
      await loadVariables()
    } catch (e) {
      setError(String(e))
    }
  }

  const renderVariables = () => {
    const filterVars = (vars: EnvVars) => {
      if (!searchQuery) return vars
      const filtered: EnvVars = {}
      Object.entries(vars).forEach(([name, value]) => {
        if (name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            value.toLowerCase().includes(searchQuery.toLowerCase())) {
          filtered[name] = value
        }
      })
      return filtered
    }

    const filteredUserVars = filterVars(userVars)
    const filteredSystemVars = filterVars(systemVars)

    return (
      <div>
        <div className="header">
          <h1>环境变量</h1>
          <input
            type="text"
            placeholder="🔍 搜索变量..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              marginRight: '10px',
              minWidth: '200px'
            }}
          />
          <button className="btn" onClick={() => setEditModal({ name: '', value: '', type: 'user' })}>
            新建变量
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <h2 style={{ marginBottom: '16px' }}>用户变量 ({Object.keys(filteredUserVars).length})</h2>
        {Object.entries(filteredUserVars).map(([name, value]) => (
          <div key={name} className="var-card">
            <div className="var-card-header">
              <div className="var-name">{name}</div>
              <div className="var-actions">
                <button className="icon-btn" onClick={() => setEditModal({ name, value, type: 'user' })}>
                  ✏️
                </button>
                <button className="icon-btn" onClick={() => handleDelete(name, 'user')}>
                  🗑️
                </button>
              </div>
            </div>
            <div className="var-value">{value}</div>
          </div>
        ))}

        <h2 style={{ margin: '32px 0 16px' }}>系统变量 ({Object.keys(filteredSystemVars).length})</h2>
        {Object.entries(filteredSystemVars).map(([name, value]) => (
          <div key={name} className="var-card">
            <div className="var-card-header">
              <div className="var-name">{name}</div>
              <div className="var-actions">
                <button className="icon-btn" onClick={() => setEditModal({ name, value, type: 'system' })}>
                  ✏️
                </button>
                <button className="icon-btn" onClick={() => handleDelete(name, 'system')}>
                  🗑️
                </button>
              </div>
            </div>
            <div className="var-value">{value}</div>
          </div>
        ))}
      </div>
    )
  }

  const renderPathEditor = () => {
    const pathValue = userVars.Path || ''

    const loadPathAnalysis = async () => {
      try {
        const entries = await invoke<PathEntry[]>('analyze_path', { pathString: pathValue })
        setPathEntries(entries)
      } catch (e) {
        setError(String(e))
      }
    }

    const loadOptimizations = async () => {
      try {
        const allVars = { ...userVars, ...systemVars }
        const opts = await invoke<OptimizationSuggestion[]>('suggest_optimizations', {
          pathString: pathValue,
          existingVars: allVars
        })
        setSuggestions(opts)
      } catch (e) {
        setError(String(e))
      }
    }

    const applyOptimization = async (s: OptimizationSuggestion) => {
      try {
        // 1. 创建新变量
        await invoke('set_user_variable', { name: s.var_name, value: s.var_value })

        // 2. 更新 PATH
        const paths = pathValue.split(';').filter(p => p.trim())
        const updatedPaths = paths.map(p => p === s.old_path ? s.new_path : p)
        await invoke('set_user_variable', { name: 'Path', value: updatedPaths.join(';') })

        // 3. 重新加载
        await loadVariables()
        setSuggestions([])
        setPathEntries([])
      } catch (e) {
        setError(String(e))
      }
    }

    const handleDragStart = (index: number) => {
      setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault()
      if (draggedIndex === null || draggedIndex === index) return

      const newEntries = [...pathEntries]
      const draggedItem = newEntries[draggedIndex]
      newEntries.splice(draggedIndex, 1)
      newEntries.splice(index, 0, draggedItem)
      setPathEntries(newEntries)
      setDraggedIndex(index)
    }

    const handleDragEnd = async () => {
      if (draggedIndex === null) return
      try {
        const newPath = pathEntries.map(e => e.path).join(';')
        await invoke('set_user_variable', { name: 'Path', value: newPath })
        await loadVariables()
      } catch (e) {
        setError(String(e))
      }
      setDraggedIndex(null)
    }

    if (pathEntries.length === 0 && pathValue) {
      loadPathAnalysis()
    }

    return (
      <div>
        <div className="header">
          <h1>PATH 编辑器</h1>
          <button className="btn" onClick={loadOptimizations}>
            ✨ 智能优化
          </button>
        </div>
        {pathEntries.map((entry, idx) => (
          <div
            key={idx}
            className="path-item"
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            style={{
              borderLeft: entry.has_variable ? '3px solid #89b4fa' : entry.valid ? '3px solid #a6e3a1' : '3px solid #f38ba8',
              cursor: 'move',
              opacity: draggedIndex === idx ? 0.5 : 1
            }}>
            <span>⋮⋮ {entry.path}</span>
            {!entry.valid && !entry.has_variable && <span style={{color: '#f38ba8', marginLeft: '10px'}}>❌ 路径不存在</span>}
            {entry.has_variable && <span style={{color: '#89b4fa', marginLeft: '10px'}}>🔵 变量引用</span>}
          </div>
        ))}
        {suggestions.length > 0 && (
          <div style={{marginTop: '20px'}}>
            <h2>优化建议</h2>
            {suggestions.map((s, idx) => (
              <div key={idx} className="var-card">
                <div className="var-card-header">
                  <div className="var-name">{s.description}</div>
                  <button className="btn" onClick={() => applyOptimization(s)}>
                    ✅ 应用
                  </button>
                </div>
                <div className="var-value">
                  创建变量: {s.var_name} = {s.var_value}<br/>
                  替换: {s.old_path} → {s.new_path}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderBackup = () => {
    const loadBackups = async () => {
      try {
        const list = await invoke<string[]>('list_backups')
        setBackups(list)
      } catch (e) {
        setError(String(e))
      }
    }

    const createBackup = async () => {
      try {
        const filename = await invoke<string>('create_backup')
        alert(`备份已创建: ${filename}`)
        loadBackups()
      } catch (e) {
        setError(String(e))
      }
    }

    const restoreBackup = async (filename: string) => {
      if (!confirm(`确定要恢复备份 "${filename}" 吗？`)) return
      try {
        await invoke('restore_backup', { filename })
        await loadVariables()
        alert('备份已恢复')
      } catch (e) {
        setError(String(e))
      }
    }

    if (backups.length === 0) {
      loadBackups()
    }

    return (
      <div>
        <div className="header">
          <h1>备份管理</h1>
          <button className="btn" onClick={createBackup}>
            💾 创建备份
          </button>
        </div>
        {backups.length === 0 ? (
          <div>暂无备份</div>
        ) : (
          backups.map((filename, idx) => (
            <div key={idx} className="var-card">
              <div className="var-card-header">
                <div className="var-name">{filename}</div>
                <button className="btn" onClick={() => restoreBackup(filename)}>
                  ↩️ 恢复
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  if (loading) {
    return <div className="loading">加载中...</div>
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">环境变量管理器</div>
        <div className={`nav-button ${view === 'variables' ? 'active' : ''}`} onClick={() => setView('variables')}>
          📋 变量列表
        </div>
        <div className={`nav-button ${view === 'path' ? 'active' : ''}`} onClick={() => setView('path')}>
          🛣️ PATH 编辑
        </div>
        <div className={`nav-button ${view === 'backup' ? 'active' : ''}`} onClick={() => setView('backup')}>
          💾 备份管理
        </div>
        <div className={`nav-button ${view === 'optimizer' ? 'active' : ''}`} onClick={() => setView('optimizer')}>
          ✨ 智能优化
        </div>
      </div>

      <div className="content">
        {view === 'variables' && renderVariables()}
        {view === 'path' && renderPathEditor()}
        {view === 'backup' && renderBackup()}
        {view === 'optimizer' && <div>智能优化功能开发中...</div>}
      </div>

      {editModal && (
        <div className="modal" onClick={() => setEditModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">{editModal.name ? '编辑变量' : '新建变量'}</div>
            <div className="form-group">
              <label>变量名</label>
              <input
                type="text"
                value={editModal.name}
                onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                disabled={!!editModal.name}
              />
            </div>
            <div className="form-group">
              <label>变量值</label>
              <textarea
                value={editModal.value}
                onChange={(e) => setEditModal({ ...editModal, value: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setEditModal(null)}>
                取消
              </button>
              <button className="btn" onClick={handleSave}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
