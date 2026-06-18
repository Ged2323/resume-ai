#!/usr/bin/env bash
# Resume AI dev environment — 4-pane tmux layout
# Top-left: Claude Code | Top-right: frontend
# Bottom-left: backend  | Bottom-right: shell

SESSION="resume-ai"
ROOT="$HOME/resume-ai"

tmux new-session -d -s "$SESSION" -x "$(tput cols)" -y "$(tput lines)"

# Split top-right
tmux split-window -h -t "$SESSION:0"

# Split bottom-left
tmux split-window -v -t "$SESSION:0.0"

# Split bottom-right
tmux split-window -v -t "$SESSION:0.1"

# Pane 0 (top-left): Claude Code
tmux send-keys -t "$SESSION:0.0" "cd $ROOT && claude" Enter

# Pane 1 (top-right): frontend dev server
tmux send-keys -t "$SESSION:0.1" "cd $ROOT/frontend && npm run dev" Enter

# Pane 2 (bottom-left): backend server
tmux send-keys -t "$SESSION:0.2" "cd $ROOT/backend && uvicorn app.main:app --reload" Enter

# Pane 3 (bottom-right): shell
tmux send-keys -t "$SESSION:0.3" "cd $ROOT" Enter

# Focus top-left (Claude)
tmux select-pane -t "$SESSION:0.0"

tmux attach-session -t "$SESSION"
