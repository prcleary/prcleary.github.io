---
title: My Git cheatsheet
date: 2022-11-08
tags:
  - Git
  - Cheatsheet
---

### Create a branch from a specific commit hash

```bash
git branch branch_name <commit-hash>
```

### Compare latest commit with previous commit

```bash
git show
```

### Undo git revert

```bash
git cherry-pick <id-of-reverted-commit>
```
### Safely roll back to a specific commit

```bash
git revert --no-commit <commit-id>..HEAD
git commit -m "..."
```

### Show all the recent commits with their changes

```bash
git log -p
```

### Compare branches

Green/red changes in 2nd branch relative to 1st branch

```bash
git diff master..dev
```

### Commit current changes to separate new branch

```bash
git stash
git checkout -b new_branch
git stash pop
git add <whatever>
git commit -m "Whatever"
git push -u origin new_branch
```

### How to restore your main branch to the remote version

e.g. when you've accidentally made minor unimportant commits to the local main branch, causing a merge conflict when you pull, and you want to throw away those commits

```bash
git merge --abort  # if still merging
git fetch origin main
git reset --hard FETCH_HEAD
git clean -df  # NB will delete files
```

### Delete remote branch

When you have deleted the local branch with `git branch -d branchname` and now want to delete the remote branch too

```bash
git push origin -d branchname
```

### Compare last commit with 3 commits before that

```bash
git diff HEAD~3
```
