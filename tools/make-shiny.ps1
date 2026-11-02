# Erzeugt Schimmer-Varianten (img/monsters/<id>_shiny.png) aus den Monster-Bildern durch Umfärben.
# Aufruf:  powershell -File tools/make-shiny.ps1            (alle aus der Tabelle unten)
#          powershell -File tools/make-shiny.ps1 -Only pochi (nur eins)
# Neue Monster: Zeile in $set ergänzen. Werte = Farbton-Verschiebung (Grad), Sättigung ×, Helligkeit +, Mindest-Sättigung.
param([string]$Only = '')

$code = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public static class Shiny {
  static void ToHsl(double r, double g, double b, out double h, out double s, out double l) {
    double max = Math.Max(r, Math.Max(g, b)), min = Math.Min(r, Math.Min(g, b));
    l = (max + min) / 2; h = 0; s = 0;
    if (max == min) return;
    double d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max == r) h = (g - b) / d + (g < b ? 6 : 0); else if (max == g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    h /= 6;
  }
  static double Hue2(double p, double q, double t) {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1.0 / 6) return p + (q - p) * 6 * t;
    if (t < 0.5) return q;
    if (t < 2.0 / 3) return p + (q - p) * (2.0 / 3 - t) * 6;
    return p;
  }
  // Verschiebt den Farbton, ändert Sättigung und Helligkeit; Transparenz, Umrisse und Glanzpunkte bleiben.
  public static void Make(string inPath, string outPath, double hueDeg, double satMul, double lightAdd, double minSat) {
    using (var src = new Bitmap(inPath))
    using (var bmp = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(bmp)) g.DrawImage(src, 0, 0, src.Width, src.Height);
      var rect = new Rectangle(0, 0, bmp.Width, bmp.Height);
      var data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int n = data.Stride * bmp.Height; var px = new byte[n];
      Marshal.Copy(data.Scan0, px, 0, n);
      for (int i = 0; i < n; i += 4) {
        if (px[i + 3] == 0) continue;
        double b = px[i] / 255.0, gr = px[i + 1] / 255.0, r = px[i + 2] / 255.0, h, s, l;
        ToHsl(r, gr, b, out h, out s, out l);
        if (l < 0.12 || l > 0.95) continue;
        h = (h + hueDeg / 360.0) % 1.0; if (h < 0) h += 1;
        s = Math.Min(1, Math.Max(minSat * (1 - Math.Abs(2 * l - 1)), s * satMul));
        l = Math.Min(1, Math.Max(0, l + lightAdd));
        double q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
        px[i + 2] = (byte)Math.Round(Hue2(p, q, h + 1.0 / 3) * 255);
        px[i + 1] = (byte)Math.Round(Hue2(p, q, h) * 255);
        px[i] = (byte)Math.Round(Hue2(p, q, h - 1.0 / 3) * 255);
      }
      Marshal.Copy(px, 0, data.Scan0, n);
      bmp.UnlockBits(data);
      bmp.Save(outPath, ImageFormat.Png);
    }
  }
}
'@
Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

$dir = Join-Path $PSScriptRoot '..\img\monsters'
$set = [ordered]@{
  glimmi = @(-55, 0.85, 0.06, 0); glutaro = @(-40, 1.0, 0.03, 0); plitsch = @(-45, 1.0, 0.02, 0); platschotter = @(-45, 1.0, 0.0, 0)
  knospi = @(-60, 1.1, 0.04, 0); bluehreh = @(-60, 1.1, 0.02, 0); summsel = @(140, 1.0, 0.03, 0); kieselkrabb = @(185, 0.6, 0.0, 0)
  moosling = @(160, 0.9, 0.04, 0); tropfling = @(130, 1.0, 0.03, 0); nachtschu = @(-60, 0.6, 0.02, 0); zwirbel = @(180, 0.25, 0.1, 0)
  pilzpuff = @(100, 1.1, 0.03, 0); lumini = @(120, 1.0, 0.0, 0); brummfels = @(190, 1.0, 0.02, 0); dornkoenigin = @(120, 1.0, 0.0, 0)
  wispelin = @(-85, 1.2, 0.04, 0); pochi = @(12, 3.2, -0.04, 0.7)
  zapfi = @(-140, 1.0, 0.03, 0); blitzigel = @(-140, 1.0, 0.02, 0); kiesi = @(150, 1.0, 0.03, 0); felspanzer = @(150, 1.0, 0.0, 0)
  nachtmiez = @(0, 0.25, 0.25, 0); schattenpanther = @(-80, 0.9, 0.06, 0); schattenpantherin = @(-80, 0.9, 0.06, 0)
  pustelinchen = @(-90, 1.0, 0.03, 0); aschling = @(180, 1.0, 0.03, 0); flammfee = @(-60, 1.0, 0.04, 0)
  aschegeist = @(-120, 0.6, 0.15, 0); magmolch = @(130, 0.9, 0.0, 0); lavarisk = @(130, 0.9, 0.0, 0); steinspatz = @(140, 1.0, 0.02, 0); felsfalke = @(140, 1.0, 0.02, 0)
  zischkaefer = @(170, 1.0, 0.0, 0); russmaus = @(-60, 0.3, 0.25, 0); geysirling = @(140, 1.0, 0.03, 0); rostratte = @(0, 0.2, 0.05, 0); stahlratte = @(45, 1.6, 0.05, 0.4)
  basaltbock = @(-150, 0.8, 0.1, 0); kristallwurm = @(145, 1.0, 0.03, 0); mirrok = @(-100, 1.0, 0.05, 0); sunnyfex = @(180, 0.6, 0.15, 0); schmiedgolem = @(-30, 1.0, 0.0, 0)
  blitzfink = @(-80, 1.0, 0.03, 0); donneradler = @(-140, 0.8, 0.05, 0); kraehling = @(0, 0.2, 0.3, 0); rabenfuerst = @(0, 0.25, 0.25, 0); windwiesel = @(-160, 1.0, 0.03, 0)
  sturmmarder = @(-160, 1.0, 0.05, 0); wolkenwoll = @(-50, 1.2, 0.03, 0); gipfelbock = @(-170, 1.2, 0.02, 0); alpenknospe = @(-90, 1.0, 0.03, 0); flockling = @(110, 1.1, 0.02, 0)
  frostbaer = @(70, 1.0, 0.0, 0); edelweissa = @(-60, 1.2, 0.02, 0); nebelmotte = @(-90, 1.0, 0.02, 0); himmelsdrache = @(150, 1.0, 0.03, 0); nyxelle = @(0, 0.25, 0.3, 0)
  sturmkrone = @(0, 1.0, 0.0, 0); blubbfisch = @(170, 1.0, 0.03, 0); schillerhai = @(170, 1.0, 0.02, 0); korallino = @(110, 1.0, 0.02, 0); quallie = @(-130, 1.0, 0.02, 0)
  tiefenlaterne = @(180, 1.0, 0.05, 0); abyssa = @(0, 1.0, 0.0, 0); stellio = @(-120, 0.8, 0.03, 0); schleierdrache = @(0, 1.0, 0.0, 0)
  flimmerfalter = @(-100, 1.0, 0.03, 0); aurorafalter = @(-120, 1.0, 0.03, 0); zahnradwicht = @(40, 1.5, 0.05, 0.3); uhrwerkritter = @(160, 0.8, 0.05, 0); taktgeist = @(0, 0.2, 0.3, 0)
  reifkitz = @(-130, 0.9, 0.03, 0); polarhirsch = @(55, 1.2, 0.03, 0); echomotte = @(50, 0.4, 0.2, 0); scherbenkrebs = @(-160, 1.0, 0.03, 0)
  vergessling = @(50, 1.0, 0.03, 0); schleierfuchs = @(-150, 1.0, 0.03, 0); zeitwal = @(-130, 0.7, 0.05, 0); velumora = @(0, 1.0, 0.0, 0)
}
foreach ($k in $set.Keys) {
  if ($Only -and $k -ne $Only) { continue }
  $in = Join-Path $dir "$k.png"
  if (-not (Test-Path $in)) { "{0,-14} übersprungen (kein Bild)" -f $k; continue }
  $a = $set[$k]
  [Shiny]::Make((Resolve-Path $in).Path, (Join-Path (Resolve-Path $dir).Path "${k}_shiny.png"), $a[0], $a[1], $a[2], $a[3])
  "{0,-14} fertig" -f $k
}
