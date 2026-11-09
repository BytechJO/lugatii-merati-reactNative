$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.Text;
public class LetterMaskBuilder {
  public static string Build(string symbol, string target) {
    using (var bitmap = new Bitmap(256,256,PixelFormat.Format32bppArgb)) {
      using (var g=Graphics.FromImage(bitmap))
      using (var font=new Font("Arial",180,FontStyle.Bold,GraphicsUnit.Pixel))
      using (var format=new StringFormat()) {
        g.Clear(Color.Transparent); g.TextRenderingHint=TextRenderingHint.AntiAliasGridFit;
        format.Alignment=StringAlignment.Center; format.LineAlignment=StringAlignment.Center;
        format.FormatFlags=StringFormatFlags.DirectionRightToLeft;
        g.DrawString(symbol,font,Brushes.White,new RectangleF(0,0,256,256),format);
      }
      bitmap.Save(target,ImageFormat.Png);
      var result=new StringBuilder("["); bool first=true;
      for(int y=1;y<256;y+=2) for(int x=1;x<256;x+=2) {
        if(bitmap.GetPixel(x,y).A<128) continue;
        if(!first)result.Append(","); first=false;
        result.Append("[").Append(x).Append(",").Append(y).Append("]");
      }
      return result.Append("]").ToString();
    }
  }
}
'@
$mobileRoot = Split-Path $PSScriptRoot -Parent
$repoRoot = Split-Path $mobileRoot -Parent
$outputDirectory = Join-Path $mobileRoot 'assets/letters'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$content = Get-Content -Raw -Encoding UTF8 (Join-Path $repoRoot 'docs/database/arabic-exercises.content.json') | ConvertFrom-Json
$entries = @()
for ($letterIndex=0; $letterIndex -lt $content.Count; $letterIndex++) {
  $points = [LetterMaskBuilder]::Build($content[$letterIndex].symbol,(Join-Path $outputDirectory "$letterIndex.png"))
  $entries += '"' + $content[$letterIndex].symbol + '":' + $points
}
[IO.File]::WriteAllText((Join-Path $mobileRoot 'src/data/letter-masks.json'),('{' + ($entries -join ',') + '}'),[Text.UTF8Encoding]::new($false))
Write-Output 'Generated 28 letter masks and their coverage samples.'
