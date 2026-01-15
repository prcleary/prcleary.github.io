+++
title = "Automatically email yourself tomorrow's calendar"
+++

I sometimes have early meetings and it is nice to check while still in bed. This uses a PowerShell script to send an email containing tomorrow's calendar events to a specified email address.

Create the PowerShell script: `Send-OutlookCalendarEmail.ps1`:

```powershell
param (
    [Parameter(Mandatory = $true)]
    [string]$RecipientEmail,

    [datetime]$Date = (Get-Date).Date.AddDays(1),

    [string]$EmailSubjectPrefix = "Calendar Events for"
)

# -----------------------------
# CONNECT TO OUTLOOK
# -----------------------------
$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace("MAPI")
$calendar = $namespace.GetDefaultFolder(9) # olFolderCalendar
$items = $calendar.Items

# Ensure correct behavior
$items.Sort("[Start]")
$items.IncludeRecurrences = $true

# -----------------------------
# DATE RANGE
# -----------------------------
$startOfDay = $Date.Date
$endOfDay   = $startOfDay.AddDays(1)

$filter = "[Start] >= '" + $startOfDay.ToString("g") +
          "' AND [Start] < '" + $endOfDay.ToString("g") + "'"

$appointments = $items.Restrict($filter)

# -----------------------------
# BUILD EMAIL BODY
# -----------------------------
$body = "Calendar events for " + $Date.ToString("dddd, MMMM dd, yyyy") + "`r`n`r`n"

if ($appointments.Count -eq 0) {

    $body += "No events scheduled.`r`n"

} else {

    foreach ($appt in $appointments) {

        $start = $appt.Start
        $end   = $appt.End

        $body += "- " + $appt.Subject + "`r`n"
        $body += "  Time: " +
                 $start.ToString("hh:mm tt") +
                 " - " +
                 $end.ToString("hh:mm tt") + "`r`n"

        if ($appt.Location) {
            $body += "  Location: " + $appt.Location + "`r`n"
        }

        $body += "`r`n"
    }
}

# -----------------------------
# SEND EMAIL
# -----------------------------
$mail = $outlook.CreateItem(0) # olMailItem
$mail.To = $RecipientEmail
$mail.Subject = "$EmailSubjectPrefix $($Date.ToString('MMMM dd, yyyy'))"
$mail.Body = $body
$mail.Send()

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

Run it:

```powershell
.\Send-OutlookCalendarEmail.ps1 `
  -RecipientEmail "name@domain.tld" `
  -Date (Get-Date).AddDays(1)
```

You can add this to Task Scheduler.
