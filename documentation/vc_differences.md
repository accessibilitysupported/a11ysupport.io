# Differences between voice control software

| Name | Name overlay | Number overlay | Grid overlay | Activate by name | Disambiguate names | Activate by role | Disambiguate roles | Supports label in name | Supports name in label |
|---------------------------|--------------|------------------------|--------------|------------------|--------------------|------------------|--------------------|------------------------|------------------------|
| Dragon Naturally Speaking | No | No | Yes | Yes | Click first match | Yes | Yes | Yes | Yes |
| Voice Access for Android | No | Only interactive roles | No | Yes | Flag with numbers | No | NA | Yes | Yes |
| VC for iOS | Yes | Everything | Yes | Yes | Flag with numbers | No | NA | Yes | No |
| VC for MacOS | No | Only interactive roles | Yes | Yes | Flag with numbers | No | NA | No | No |


Notes:
 
 * VC for MacOS, when saying something like "click \<name\>", \<name\> appears to be limited to 4 words. If the name is longer than 4 words, it will not be recognized.
 * Label in name means that a user can say  "click \<visible label\>" when the programmatic name (via something like aria-label) contains the visible label. This is a term found in [WCAG 2.1 SC 2.5.3](https://www.w3.org/WAI/WCAG21/Understanding/label-in-name.html).
 * Name in label is the opposite of label in name. In this case programmatic name is shorter than the visible label, but the programmatic name can be found in the visible label. This term is not found in WCAG.
