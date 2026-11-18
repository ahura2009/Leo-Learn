param(
  [string]$PdfPath,
  [string]$OutDir,
  [int]$First = 1,
  [int]$Last = 113,
  [double]$Scale = 1.5
)

Add-Type -AssemblyName System.Runtime.WindowsRuntime

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
})[0]

$asTaskAction = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction'
})[0]

function Await($WinRtTask, $ResultType) {
    if ($ResultType -eq [Windows.Foundation.IAsyncAction]) {
        $netTask = $asTaskAction.Invoke($null, @($WinRtTask))
    } else {
        $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
        $netTask = $asTask.Invoke($null, @($WinRtTask))
    }
    $netTask.Wait(-1) | Out-Null
    $netTask.Result
}

# Load WinRT type
$null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]

$file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($PdfPath)) ([Windows.Storage.StorageFile])
$pdf = Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])

Write-Output ("PAGE_COUNT=" + $pdf.PageCount)

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

$total = $pdf.PageCount
$end = [Math]::Min($Last, $total)
for ($i = $First; $i -le $end; $i++) {
    $page = $pdf.GetPage($i - 1)
    $outPath = Join-Path $OutDir ("p{0:D3}.png" -f $i)
    if (Test-Path $outPath) { $page.Dispose(); continue }

    $stream = [Windows.Storage.StorageFile]::GetFileFromPathAsync((Join-Path (Get-Location).Path ("tmp_" + [guid]::NewGuid().ToString() + ".tmp")))
    $null = $page
    $ms = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
    $opts = New-Object Windows.Data.Pdf.PdfPageRenderOptions
    $opts.DestinationWidth = [uint32]([Math]::Round($page.Size.Width * $Scale))
    $renderOp = $page.RenderToStreamAsync($ms, $opts)
    Await $renderOp ([Windows.Foundation.IAsyncAction]) | Out-Null

    # copy to file
    $reader = New-Object Windows.Storage.Streams.DataReader($ms.GetInputStreamAt(0))
    $len = [uint32]$ms.Size
    $readOp = $reader.LoadAsync($len)
    Await $readOp ([uint32]) | Out-Null
    $bytes = New-Object byte[] $len
    $reader.ReadBytes($bytes)
    [System.IO.File]::WriteAllBytes($outPath, $bytes)
    $reader.Dispose()
    $ms.Dispose()
    $page.Dispose()
}
Write-Output "DONE"
