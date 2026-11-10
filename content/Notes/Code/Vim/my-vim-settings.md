---
title: My Vim settings
date: 2022-11-15
tags:
  - Vim
---

```vim
" Plugins
call plug#begin()
Plug 'dbeniamine/todo.txt-vim'
Plug 'mattn/emmet-vim'
Plug 'quarto-dev/quarto-vim'
Plug 'vim-pandoc/vim-pandoc'
Plug 'vim-pandoc/vim-pandoc-syntax'
Plug 'vim-pandoc/vim-rmarkdown'
call plug#end()

" Settings for plugins
let g:Todo_txt_prefix_creation_date=1  " add dates to tasks
let g:user_emmet_leader_key=','

" Personal settings
set encoding=utf-8
set guifont=Consolas:h12:cANSI:qDRAFT
set textwidth=0
set wrap

" Personal other stuff
noremap <C-A> <C-A>  " can't remember why I needed to do this - possibly related to todo.txt-vim
" Fold lines not matching last search pattern
nnoremap \z :setlocal foldexpr=(getline(v:lnum)=~@/)?0:(getline(v:lnum-1)=~@/)\\|\\|(getline(v:lnum+1)=~@/)?1:2 foldmethod=expr foldlevel=0 foldcolumn=2<CR>
```

Also check this out: <http://vim.wikia.com/wiki/Example_vimrc>

