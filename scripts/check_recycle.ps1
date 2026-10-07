$shell = New-Object -ComObject Shell.Application
$bin = $shell.Namespace(0xA)
$items = $bin.Items()
foreach ($item in $items) {
    if ($item.Name -like "*pano*" -or $item.Name -like "*extract*" -or $item.Name -like "*mars*" -or $item.Name -like "*jpg*" -or $item.Name -like "*png*") {
        Write-Output ("NAME: " + $item.Name + " | PATH: " + $item.Path)
    }
}
