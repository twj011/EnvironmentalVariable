import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'

interface EnvVars {
  [key: string]: string
}

type View = 'variables' | 'path' | 'backup' | 'optimizer'

function App() {
  const [view, setView] = useState<View>('variables')
  const [userVars, setUserVars] = useState<EnvVars>({})
  const [systemVars, setSystemVars] = useState<EnvVars>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editModal, setEditModal] = useState<{ name: string; value: string; type: 'user' | 'system' } | null>(null)

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

  const renderVariables = () => (
    <div>
      <div className="header">
        <h1>环境变量</h1>
        <button className="btn" onClick={() => setEditModal({ name: '', value: '', type: 'user' })}>
          新建变量
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <h2 style={{ marginBottom: '16px' }}>用户变量</h2>
      {Object.entries(userVars).map(([name, value]) => (
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

      <h2 style={{ margin: '32px 0 16px' }}>系统变量</h2>
      {Object.entries(systemVars).map(([name, value]) => (
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

  const renderPathEditor = () => {
    const pathValue = userVars.Path || ''
    const paths = pathValue.split(';').filter(p => p.trim())

    return (
      <div>
        <div className="header">
          <h1>PATH 编辑器</h1>
        </div>
        {paths.map((path, idx) => (
          <div key={idx} className="path-item">
            <span>{path}</span>
          </div>
        ))}
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
        {view === 'backup' && <div>备份管理功能开发中...</div>}
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
