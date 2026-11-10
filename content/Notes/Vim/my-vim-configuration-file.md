---
title: My Vim configuration file
tags:
  - Vim
---

![](https://external-preview.redd.it/LpuUdPutERMVFKPZUHAT1asPA4KfH2n7HbIgERtMtCs.jpg?auto=webp&s=4fa3063ad9a9ad012083d658f84cc2b0d3c9dd9d)

[Vim](https://www.vim.org/) is an incredibly powerful text editor that is worth learning if you are going to do a lot of coding and also know how to touch type. Basically everything is done through a combination of keyboard shortcuts (no need to use the mouse) so it is very fast to work with, and it is very handy for doing repetitive tasks (e.g. data cleaning) as you can easily create macros.

Of course Vim is open source and free to use, and you can get it on any operating system, and most integrated development environments or text editors (like RStudio) have a "Vim mode" so you can use it anywhere. I even have it embedded into this blog and am using it now.

It also has a lot of plugins - I use one every day to maintain my barebones [todo.txt](https://github.com/todotxt/todo.txt) file of tasks (still haven't found a better way to organise myself).

It does take a little time to learn, but you can be up to speed with the basics before very long. Even if you are happy with your existing text/code editor, it is still worth knowing the basics of Vim, such as how to exit Vim (Git uses Vim by default and you may get stuck one day if you don't know how to exit Vim - it is `:q` then Enter, which is not exactly obvious).

There are loads of resources online that you can use to learn Vim. If you just want an overview then check out the always excellent [Learn X in Y Minutes](https://learnxinyminutes.com/docs/vim/) page on Vim. There are many [videos](http://derekwyatt.org/vim/tutorials/index.html), [tutorials](https://danielmiessler.com/study/vim/), [more](https://thevaluable.dev/vim-commands-beginner/) [tutorials](https://yannesposito.com/Scratch/en/blog/Learn-Vim-Progressively/), [even](https://www.vim.so/) [interactive](https://vim-adventures.com/) [online](https://www.openvim.com/tutorial.html) [games](https://vimmer.io/), books and much more.

Vim has many settings which are all saved in a text file often called `_gvimrc` on Windows and `.vimrc` on Linux (and probably on the Mac too).

If you don't want to spend a lot of time tweaking these to your exact liking, then there is a good template [here](https://vim.fandom.com/wiki/Example_vimrc).

In case it is useful to anyone, this is what my `_gvimrc` file currently looks like:

```bash
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
let g:user_emmet_leader_key=','  " use commas to trigger Emmet

" Personal settings
set encoding=utf-8
set guifont=Consolas:h12:cANSI:qDRAFT
set textwidth=0
set wrap
colorscheme murphy
set noundofile
set nobackup
set directory=~

" Personal other stuff
noremap <C-A> <C-A>  " can't remember why I needed to do this - possibly related to todo.txt-vim

" Fold lines not matching last search pattern
nnoremap \z :setlocal foldexpr=(getline(v:lnum)=~@/)?0:(getline(v:lnum-1)=~@/)\\|\\|(getline(v:lnum+1)=~@/)?1:2 foldmethod=expr foldlevel=0 foldcolumn=2<CR>

" Misc other stuff
" URL: http://vim.wikia.com/wiki/Example_vimrc
"
" Authors: http://vim.wikia.com/wiki/Vim_on_Freenode
" Description: A minimal, but feature rich, example .vimrc. If you are a
"              newbie, basing your first .vimrc on this file is a good choice.
"              If you're a more advanced user, building your own .vimrc based
"              on this file is still a good idea.

"------------------------------------------------------------
" Features {{{1
"
" These options and commands enable some very useful features in Vim, that
" no user should have to live without.

" Set 'nocompatible' to ward off unexpected things that your distro might
" have made, as well as sanely reset options when re-sourcing .vimrc
set nocompatible

" Attempt to determine the type of a file based on its name and possibly its
" contents. Use this to allow intelligent auto-indenting for each filetype,
" and for plugins that are filetype specific.
"
filetype indent plugin on

" Enable syntax highlighting
syntax on


"------------------------------------------------------------
" Must have options {{{1
"
" These are highly recommended options.

" Vim with default settings does not allow easy switching between multiple files
" in the same editor window. Users can use multiple split windows or multiple
" tab pages to edit multiple files, but it is still best to enable an option to
" allow easier switching between files.
"
" One such option is the 'hidden' option, which allows you to re-use the same
" window and switch from an unsaved buffer without saving it first. Also allows
" you to keep an undo history for multiple files when re-using the same window
" in this way. Note that using persistent undo also lets you undo in multiple
" files even in the same window, but is less efficient and is actually designed
" for keeping undo history after closing Vim entirely. Vim will complain if you
" try to quit without saving, and swap files will keep you safe if your computer
" crashes.
set hidden

" Note that not everyone likes working this way (with the hidden option).
" Alternatives include using tabs or split windows instead of re-using the same
" window as mentioned above, and/or either of the following options:
" set confirm
" set autowriteall

" Better command-line completion
set wildmenu

" Show partial commands in the last line of the screen
set showcmd

" Highlight searches (use <C-L> to temporarily turn off highlighting; see the
" mapping of <C-L> below)
set hlsearch

" Modelines have historically been a source of security vulnerabilities. As
" such, it may be a good idea to disable them and use the securemodelines
" script, <http://www.vim.org/scripts/script.php?script_id=1876>.
" set nomodeline


"------------------------------------------------------------
" Usability options {{{1
"
" These are options that users frequently set in their .vimrc. Some of them
" change Vim's behaviour in ways which deviate from the true Vi way, but
" which are considered to add usability. Which, if any, of these options to
" use is very much a personal preference, but they are harmless.

" Use case insensitive search, except when using capital letters
set ignorecase
set smartcase

" Allow backspacing over autoindent, line breaks and start of insert action
set backspace=indent,eol,start

" When opening a new line and no filetype-specific indenting is enabled, keep
" the same indent as the line you're currently on. Useful for READMEs, etc.
set autoindent

" Stop certain movements from always going to the first character of a line.
" While this behaviour deviates from that of Vi, it does what most users
" coming from other editors would expect.
set nostartofline

" Display the cursor position on the last line of the screen or in the status
" line of a window
set ruler

" Always display the status line, even if only one window is displayed
set laststatus=2

" Instead of failing a command because of unsaved changes, instead raise a
" dialogue asking if you wish to save changed files.
set confirm

" Use visual bell instead of beeping when doing something wrong
set visualbell

" And reset the terminal code for the visual bell. If visualbell is set, and
" this line is also included, vim will neither flash nor beep. If visualbell
" is unset, this does nothing.
" set t_vb=

" Enable use of the mouse for all modes
" set mouse=a

" Set the command window height to 2 lines, to avoid many cases of having to
" "press <Enter> to continue"
set cmdheight=2

" Display line numbers on the left
" set number

" Quickly time out on keycodes, but never time out on mappings
" set notimeout ttimeout ttimeoutlen=200

" Use <F11> to toggle between 'paste' and 'nopaste'
" set pastetoggle=<F11>


"------------------------------------------------------------
" Indentation options {{{1
"
" Indentation settings according to personal preference.

" Indentation settings for using 4 spaces instead of tabs.
" Do not change 'tabstop' from its default value of 8 with this setup.
set shiftwidth=4
set softtabstop=4
set expandtab

" Indentation settings for using hard tabs for indent. Display tabs as
" four characters wide.
"set shiftwidth=4
"set tabstop=4


"------------------------------------------------------------
" Mappings {{{1
"
" Useful mappings

" Map Y to act like D and C, i.e. to yank until EOL, rather than act as yy,
" which is the default
" map Y y$

" Map <C-L> (redraw screen) to also turn off search highlighting until the
" next search
" nnoremap <C-L> :nohl<CR><C-L>

```

