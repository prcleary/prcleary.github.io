+++
title = "Automatically email yourself tomorrow's calendar"
+++

I sometimes have early meetings and it is nice to check while still in bed. This uses a PowerShell script to send an email containing tomorrow's calendar events to a specified email address.

Create the PowerShell script: `Send-OutlookCalendarEmail.ps1`:

```powershell
param (
    [Parameter(Mandatory = $true)]
    [string]$RecipientEmail,

    [string]$EmailSubjectPrefix = "Calendar Events for"
)

# -----------------------------
# LOG START
# -----------------------------
$log = "$env:TEMP\calendar_task.log"
Add-Content $log "$(Get-Date) - Script started"

# -----------------------------
# TARGET DATE (TOMORROW)
# -----------------------------
$Date = (Get-Date).Date.AddDays(1)

# -----------------------------
# ENSURE OUTLOOK IS RUNNING
# -----------------------------
$outlookProcess = Get-Process OUTLOOK -ErrorAction SilentlyContinue
if (-not $outlookProcess) {
    Start-Process "outlook.exe"
}

# Wait for Outlook MAPI session to be ready
$maxWait = 30
$waited = 0
do {
    Start-Sleep -Seconds 1
    try {
        $outlook = New-Object -ComObject Outlook.Application
        $namespace = $outlook.GetNamespace("MAPI")
        $null = $namespace.Folders.Count
        $ready = $true
    } catch {
        $ready = $false
    }
    $waited++
} until ($ready -or $waited -ge $maxWait)

if (-not $ready) {
    Add-Content $log "$(Get-Date) - Outlook MAPI not ready, exiting"
    exit
}

# -----------------------------
# ACCESS CALENDAR
# -----------------------------
$calendar = $namespace.GetDefaultFolder(9)
$items = $calendar.Items
$items.Sort("[Start]")
$items.IncludeRecurrences = $true

$startOfDay = $Date
$endOfDay   = $startOfDay.AddDays(1)

$filter = "[Start] >= '" + $startOfDay.ToString("g") +
          "' AND [Start] < '" + $endOfDay.ToString("g") + "'"

$appointments = $items.Restrict($filter)

# -----------------------------
# BUILD EMAIL BODY
# -----------------------------
$body = "Calendar events for " +
        $Date.ToString("dddd, MMMM dd, yyyy") + "`r`n`r`n"

if ($appointments.Count -eq 0) {

    $body += "No events scheduled.`r`n"

} else {

    foreach ($appt in $appointments) {

        $body += "- " + $appt.Subject + "`r`n"
        $body += "  Time: " +
                 $appt.Start.ToString("hh:mm tt") +
                 " - " +
                 $appt.End.ToString("hh:mm tt") + "`r`n"

        if ($appt.Location) {
            $body += "  Location: " + $appt.Location + "`r`n"
        }

        $body += "`r`n"
    }
}

# -----------------------------
# SEND EMAIL
# -----------------------------
$mail = $outlook.CreateItem(0)
$mail.To = $RecipientEmail
$mail.Subject = "$EmailSubjectPrefix $($Date.ToString('MMMM dd, yyyy'))"
$mail.Body = $body
$mail.Send()

Add-Content $log "$(Get-Date) - Mail.Send() called"

# -----------------------------
# CLEANUP
# -----------------------------
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($mail)      | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($items)     | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($calendar)  | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($namespace) | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($outlook)   | Out-Null
[GC]::Collect()
[GC]::WaitForPendingFinalizers()
```

Enable it:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Run it to check - you should get an email:

```powershell
.\Send-OutlookCalendarEmail.ps1 -RecipientEmail "name@domain.tld"
```

You can add this to Task Scheduler.

- Open Task Scheduler
- Create Task
- General
    - Give task a descriptive name 
    - Run whether user is logged on or not
- Triggers
    - Weekly, select Monday to Thursday, 5pm, enabled
- Actions
    - Start a program
    - Program/script: `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`
    - Add arguments: `-NoProfile -ExecutionPolicy Bypass -File "C:\Users\your.name\full\path\to\folder\Send-OutlookCalendarEmail.ps1" -RecipientEmail "name@domain.tld"`
    - Start in: `C:\Users\your.name\full path\Desktop`
- Conditions: Wake the computer to run this task
- Settings: tick all except one about deleting it

