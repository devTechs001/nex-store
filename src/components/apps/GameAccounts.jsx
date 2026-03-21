import { useState } from 'react'
import { Gamepad2, Key, Users, Shield, Check, X, Plus, Edit, Trash2 } from 'lucide-react'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'
import { Input } from '../common/Input'

export const GameAccounts = ({ games }) => {
  const [accounts, setAccounts] = useState([
    { id: 1, gameId: 1, gameName: 'GameEngine Core', username: 'Player1', platform: 'Steam', status: 'connected' },
    { id: 2, gameId: 2, gameName: 'MLFlow Studio', username: 'DevUser', platform: 'GitHub', status: 'connected' },
  ])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)

  const connectedGames = games.filter(g => g.category === 'library' || g.tags?.includes('game'))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold">Game Accounts</h3>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
          Connect
        </Button>
      </div>

      {accounts.length > 0 ? (
        <div className="space-y-3">
          {accounts.map(account => (
            <AccountCard
              key={account.id}
              account={account}
              onDisconnect={() => setAccounts(accounts.filter(a => a.id !== account.id))}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-bg rounded-xl">
          <Gamepad2 className="w-12 h-12 mx-auto text-text-muted mb-4" />
          <p className="text-text-muted mb-4">No connected game accounts</p>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Connect Your First Account
          </Button>
        </div>
      )}

      {showAddModal && (
        <AddAccountModal
          games={connectedGames}
          onClose={() => setShowAddModal(false)}
          onConnect={(game) => {
            setAccounts([...accounts, {
              id: Date.now(),
              gameId: game.id,
              gameName: game.name,
              username: 'NewPlayer',
              platform: 'Generic',
              status: 'connected',
            }])
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

const AccountCard = ({ account, onDisconnect }) => {
  const [showEdit, setShowEdit] = useState(false)

  return (
    <>
      <div className="card flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-transparent rounded-xl flex items-center justify-center">
          <Gamepad2 className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{account.gameName}</h4>
            <Badge variant="success" size="xs">
              <Check className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {account.username}
            </span>
            <span className="flex items-center gap-1">
              <Key className="w-3 h-3" />
              {account.platform}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={Edit} onClick={() => setShowEdit(true)} />
          <Button variant="ghost" size="sm" icon={Trash2} onClick={onDisconnect} className="text-red-400" />
        </div>
      </div>

      {showEdit && (
        <EditAccountModal
          account={account}
          onClose={() => setShowEdit(false)}
          onSave={(updated) => {
            // Handle save
            setShowEdit(false)
          }}
        />
      )}
    </>
  )
}

const AddAccountModal = ({ games, onClose, onConnect }) => {
  const [selectedGame, setSelectedGame] = useState('')
  const [username, setUsername] = useState('')
  const [platform, setPlatform] = useState('Steam')
  const [apiKey, setApiKey] = useState('')

  const platforms = ['Steam', 'Epic Games', 'GOG', 'Xbox', 'PlayStation', 'Nintendo', 'GitHub', 'Generic']

  return (
    <Modal isOpen={true} onClose={onClose} title="Connect Game Account" size="md">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text mb-2">Select Game</label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full bg-bg border-2 border-bg-secondary rounded-xl px-4 py-3 text-text focus:border-main transition-colors"
          >
            <option value="">Choose a game...</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>
        </div>

        <Input
          label="Username / Gamertag"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          icon={Users}
        />

        <div>
          <label className="block text-sm font-medium text-text mb-2">Platform</label>
          <div className="flex flex-wrap gap-2">
            {platforms.map(p => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  platform === p ? 'bg-main text-bg' : 'bg-bg hover:bg-main/20'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="API Key (Optional)"
          placeholder="Enter API key for advanced features"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          icon={Key}
          type="password"
        />

        <div className="bg-bg rounded-xl p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-main" />
            Security Notice
          </h4>
          <p className="text-sm text-text-muted">
            Your credentials are encrypted and stored securely. Never share your API key with others.
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t border-bg">
          <Button variant="ghost" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => onConnect(games.find(g => g.id === selectedGame) || { name: 'Custom Game' })} 
            fullWidth
            icon={Check}
          >
            Connect Account
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const EditAccountModal = ({ account, onClose, onSave }) => {
  const [username, setUsername] = useState(account.username)

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Account" size="sm">
      <div className="space-y-6">
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          icon={Users}
        />

        <div className="flex gap-3 pt-4 border-t border-bg">
          <Button variant="ghost" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onSave({ ...account, username })} fullWidth>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}
