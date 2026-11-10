---
title: "Getting Things Done, the todo.txt format and the quest for the perfect productivity system"
date: 2023-06-24
tags: 
  - Productivity
---

Years ago, while painfully transitioning from a regimented hospital-based existence to an alien office environment, I read the book ["Getting Things Done" by David Allen](https://en.wikipedia.org/wiki/Getting_Things_Done) and it saved my life. Well, made me more organised anyway.

There is a summary of the book's ideas [here](https://hamberg.no/gtd) - it basically outlines a workflow for managing all the stuff in your life and claims that this will reduce stress. None of it will seem revolutionary to the naturally organised person.

You can implement the basic ideas in different ways, but the things I ended up doing as a result of the book were:

- I have a physical **inbox** on my desk where I dump stuff, and also regard my various email accounts as inboxes.
- I periodically process the inbox stuff to update a **task list**.
- I **sort** my task list by priority or due date as required, and can group tasks by area of work.
- I **file** physical documents in paper folders sorted by name, and do something similar with electronic files.

There are many many mobile or desktop apps you could use to maintain your task list, and I have tried some of them, but if they are at all slow or require any maintenance or fiddling then I tend to lose interest.

The simplest and best task list solution I have found is [todo.txt](http://todotxt.org/). The idea is to keep all your tasks in a simple text file, one task per line. I have used this for several years and keep coming back to it.

This is a valid todo.txt file:

```
Set spend cap on kids' mobiles
Upgrade PHP on server
Read about FHIR
Sign up for sponsored Ben Nevis walk
Draft concept paper on data and technology for global health
Contact Fred Bloggs re book chapter
Buy milk
```

The todo.txt format specifies [various rules](https://github.com/todotxt/todo.txt) you can use to organise your list. All are optional, but the ones I use most are:

- priority: you can prefix priority tasks with a single, bracketed letter
	- I use `(A)` to `(E)`, vaguely following the [ABCDE method](https://www.briantracy.com/blog/time-management/the-abcde-list-technique-for-setting-priorities/)
	- now if you sort the text file alphabetically your priority tasks come top
- due date: you can append the due date to the task in this format: `due:2023-06-30`
- project: you can append a project tag to some tasks, in this format: `@project`

So my task list ends up looking like this after sorting:

```
(A) Buy milk @home
(B) Contact Fred Bloggs re book chapter @book
(B) Draft concept paper on data and technology for global health @gh
(B) Upgrade PHP on server @geek
(C) Set spend cap on kids' mobiles @home
(C) Sign up for sponsored Ben Nevis walk @home
Read about FHIR @reading
```

The things I like about this system are:

- it is simple and low-tech
- it is very quick to add tasks, prioritise, search
- there is a plug-in for my preferred text editor (<<tag Vim>>), which provides additional functionality such as sorting by project, saving done tasks to a separate file, or creating recurring tasks like putting the bins out
- there are some good mobile apps that can handle todo.txt files, which can also sync with something like Dropbox or Nextcloud.
	- the one I have used most is [Simpletask](https://f-droid.org/en/packages/nl.mpcjanssen.simpletask/)

The downsides of my system are:

- it is too easy to add tasks, and I add many without thinking about overcommitment
	- my todo.txt file has had several thousand lines at times, when I have started adding every book I want to read, film I want to see or climb I want to do
- I sometimes add vague aspirations that aren't clearly actionable
- I don't process my inboxes often enough, and usually only to pick out priority tasks
- I don't have an easy overview of the work ahead, so for example if I want to plan the weeks ahead, I have to do that separately
	- I have written various scripts to summarise my tasks over the years, including one that used to email me every morning with my priorities, but none that have lasted
- I only have sight of my tasks when sitting in front of my work laptop
	- but that is where I am mostly, and if I need portability I can scribble my day's hopelessly unrealistic list of tasks on a piece of folded paper or an index card
- todo.txt tasks are not necessarily importable into other task list apps you might want to try

So I am still keeping an eye out for better solutions out there. The most pressing issue is to be able to view my tasks and directly add tasks from my phone. I still need to be able to add tasks to my task list from my locked-down work laptop. Some sort of Google Calendar integration would be nice. I prefer open source software and would like to host all my own data. There needs to be minimal faff.

Years ago I used [Task Coach](https://www.taskcoach.org/index.html) and that was simple and quick to use. I like the look of [Taskwarrior](https://taskwarrior.org/) and [Super Productivity](https://super-productivity.com/), but I can't use those from my work laptop.

So some combination of Web app and Android app is probably my best bet.

I am a big fan of [Nextcloud](https://nextcloud.com/), which has a [Tasks app](https://apps.nextcloud.com/apps/tasks) with most of the features I need, including a calendar view on tasks, though it can't handle recurring tasks and the interface is a bit clunky. But as I already use Nextcloud for notes, file storage, online radio and recipe management, it would mean I wouldn't have to maintain another Web app.

There are a couple of task list Android apps that can sync with Nextcloud Tasks:

- [A Todo List and Note Taking Application. – OpenTodoList](https://opentodolist.rpdev.net/)
- [Tasks.org | Tasks.org](https://tasks.org/)

(On iPhone you can use something like: [GoodTask](https://goodtaskapp.com/).)

Tasks.org has more features, and can handle recurrent tasks. It also has some cool features I may or may not use:

- very flexible sorting/filtering of tasks
	- can save views such as "Today" or "Next Week"
- organising tasks into a hierarchy, with multiple levels of subtasks
- random reminders
- location-based reminders!
- dark theme (essential)
- tasks can trigger actions on your phone via the Android automation app [Tasker](https://tasker.joaoapps.com/index.html), which I already use for a couple of things

My current work laptop is dying (moribund fan, unpredictable touchpad, short battery life, dead loudspeaker) and I'm getting a replacement soon. My personal phone may also be coming to end of its usability. So it seems like a good time to try out a new productivity system and see if it is better than good old todo.txt.


