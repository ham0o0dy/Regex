// DOM Elements
const titleBtn = document.getElementById('titleBtn');
const regexPattern = document.getElementById('regexPattern');
const testString = document.getElementById('testString');
const positionInfo = document.getElementById('positionInfo');
const explanation = document.getElementById('explanation');
const matchInfo = document.getElementById('matchInfo');
const functionButtons = document.querySelectorAll('#functionButtons .btn');
const flavorButtons = document.querySelectorAll('#flavorButtons .flavor-btn');
const codeGenBtn = document.getElementById('codeGenBtn');
const codeGeneratorModal = document.getElementById('codeGeneratorModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const generateCodeBtn = document.getElementById('generateCodeBtn');
const codeOutput = document.getElementById('codeOutput');
const codeGenLangs = document.getElementById('codeGenLangs');
const flavorInfoModal = document.getElementById('flavorInfoModal');
const closeFlavorModalBtn = document.getElementById('closeFlavorModalBtn');
const aboutModal = document.getElementById('aboutModal');
const closeAboutModalBtn = document.getElementById('closeAboutModalBtn');
const toast = document.getElementById('toast');
const flagsContainer = document.getElementById('flags-container');
const presetsSelect = document.getElementById('regexPresets');

// State
let currentFlavor = 'pcre2';
let currentFunction = 'match';
let currentFlags = 'gm';
let activeMatchIndex = -1;
let matches = [];

// Preset patterns
const regexPresets = {
  'IPv4': {
    pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\b',
    description: 'Matches valid IPv4 addresses (0.0.0.0 to 255.255.255.255)',
    testString: '192.168.1.1\n10.0.0.254\n256.100.50.25\n999.999.999.999'
  },
  'BalancedParens': {
    pattern: '\\((?:[^()]*|\\([^()]*\\))*\\)',
    description: 'Matches balanced parentheses (supports 2 levels of nesting)',
    testString: '(a + b) * (c - d * (e + f)) + ((g))'
  },
  'HTMLTags': {
    pattern: '<(\\w+)[^>]*>(?:[^<]*(?:<(?!\\/\\1\\b)[^>]*>)*)<\\/\\1>',
    description: 'Matches simple HTML tags with basic nesting support',
    testString: '<div><span>Hello <span>deep</span></span></div>\n<invalid><div>test</span></div>'
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Title animation
  titleBtn.addEventListener('click', () => {
    titleBtn.classList.add('clicked');
    setTimeout(() => {
      titleBtn.classList.remove('clicked');
    }, 1000);
  });

  // Initialize flavor buttons
  flavorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      flavorButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFlavor = btn.dataset.flavor;
      updateFlagOptions();
      testRegex();
    });
  });

  // Initialize flag options
  updateFlagOptions();

  // Function selection
  functionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      functionButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFunction = btn.dataset.function;
      testRegex();
    });
  });

  // Preset selection
  if (presetsSelect) {
    presetsSelect.addEventListener('change', loadPreset);
  }

  // Code generator
  codeGenBtn.addEventListener('click', () => {
    codeGeneratorModal.style.display = 'flex';
  });

  closeModalBtn.addEventListener('click', () => {
    codeGeneratorModal.style.display = 'none';
  });

  closeFlavorModalBtn.addEventListener('click', () => {
    flavorInfoModal.style.display = 'none';
  });

  closeAboutModalBtn.addEventListener('click', () => {
    aboutModal.style.display = 'none';
  });

  generateCodeBtn.addEventListener('click', generateCode);

  // Input events with debouncing
  let timeout;
  const debounceTest = () => {
    clearTimeout(timeout);
    timeout = setTimeout(testRegex, 300);
  };
  
  regexPattern.addEventListener('input', debounceTest);
  testString.addEventListener('input', debounceTest);
  testString.addEventListener('scroll', updatePositionInfo);
  testString.addEventListener('click', updatePositionInfo);
  testString.addEventListener('keyup', updatePositionInfo);

  // Close modals when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === codeGeneratorModal) {
      codeGeneratorModal.style.display = 'none';
    }
    if (event.target === flavorInfoModal) {
      flavorInfoModal.style.display = 'none';
    }
    if (event.target === aboutModal) {
      aboutModal.style.display = 'none';
    }
  });

  // Initial test
  testRegex();
});

function loadPreset() {
  const presetName = presetsSelect.value;
  if (presetName && regexPresets[presetName]) {
    regexPattern.value = regexPresets[presetName].pattern;
    testString.value = regexPresets[presetName].testString;
    testRegex();
    showToast(`Loaded "${presetName}" preset`);
  }
}

// Update flag options based on selected flavor
function updateFlagOptions() {
  flagsContainer.innerHTML = '';
  currentFlags = '';
  
  const flavor = flavorConfigs[currentFlavor];
  
  for (const [flag, config] of Object.entries(flavor.flags)) {
    const flagBtn = document.createElement('div');
    flagBtn.className = `flag-btn ${config.default ? 'active' : ''}`;
    flagBtn.textContent = flag;
    flagBtn.title = config.name;
    
    if (config.default) {
      currentFlags += flag;
    }
    
    flagBtn.addEventListener('click', () => {
      flagBtn.classList.toggle('active');
      currentFlags = [...flagsContainer.querySelectorAll('.flag-btn.active')]
        .map(btn => btn.textContent)
        .join('');
      testRegex();
    });
    
    flagsContainer.appendChild(flagBtn);
  }
}

// Clear regex input
function clearRegex() {
  regexPattern.value = '';
  testRegex();
  showToast('Regex cleared');
}

// Clear test string
function clearTestString() {
  testString.value = '';
  testRegex();
  showToast('Test string cleared');
}

// Show flavor info
function showFlavorInfo() {
  flavorInfoModal.style.display = 'flex';
}

// Show about
function showAbout() {
  aboutModal.style.display = 'flex';
}

// Share functions
function shareToTwitter() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://twitter.com/intent/tweet?text=Check%20out%20this%20awesome%20Regex%20Tester&url=${url}`, '_blank');
}

function shareToTelegram() {
  const text = encodeURIComponent("Check out this Regex Tester");
  const url = encodeURIComponent(window.location.href);
  window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
}

function copyUrl() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => showToast('Link copied to clipboard!'))
    .catch(err => console.error('Failed to copy: ', err));
}

function copyMatches() {
  const matchesText = matchInfo.innerText;
  navigator.clipboard.writeText(matchesText)
    .then(() => showToast('Matches copied to clipboard!'))
    .catch(err => console.error('Failed to copy: ', err));
}

function copyGeneratedCode() {
  const codeText = codeOutput.innerText;
  navigator.clipboard.writeText(codeText)
    .then(() => showToast('Code copied to clipboard!'))
    .catch(err => console.error('Failed to copy: ', err));
}

// Show toast notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Update cursor position info
function updatePositionInfo() {
  const text = testString.value;
  const cursorPos = testString.selectionStart;
  
  // Calculate line and column
  const lines = text.substring(0, cursorPos).split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  
  positionInfo.textContent = `${line}:${column}`;
}

// Test the regular expression
function testRegex() {
  const pattern = regexPattern.value;
  const text = testString.value;
  
  updatePositionInfo();
  
  if (!pattern) {
    explanation.innerHTML = 'Enter a regular expression to see explanation...';
    matchInfo.innerHTML = noMatchesHTML();
    return;
  }
  
  try {
    const regex = createRegex(pattern);
    updateExplanation(regex, pattern);
    
    switch(currentFunction) {
      case 'match': processMatches(regex, text); break;
      case 'replace': processReplace(regex, text); break;
      case 'split': processSplit(regex, text); break;
      case 'test': processTest(regex, text); break;
    }
    
    highlightMatches(regex, text);
  } catch (e) {
    showError(e);
  }
}

function createRegex(pattern) {
  // Handle different flavors
  switch(currentFlavor) {
    case 'ecmascript':
      if (pattern.startsWith('/') && pattern.length > 1) {
        const lastSlash = pattern.lastIndexOf('/');
        const expr = pattern.substring(1, lastSlash);
        const inputFlags = pattern.substring(lastSlash + 1);
        return new RegExp(expr, combineFlags(inputFlags, currentFlags));
      }
      break;
    default:
      // Handle special preset patterns
      if (pattern === 'IPv4') {
        return new RegExp(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, currentFlags);
      }
      if (pattern === 'BalancedParens') {
        return new RegExp(/\((?:[^()]*|\([^()]*\))*\)/g, currentFlags);
      }
      if (pattern === 'HTMLTags') {
        return new RegExp(/<(\w+)[^>]*>(?:[^<]*(?:<(?!\/\1\b)[^>]*>)*)<\/\1>/g, currentFlags);
      }
  }
  
  return new RegExp(pattern, currentFlags);
}

function combineFlags(inputFlags, uiFlags) {
  return [...new Set([...inputFlags, ...uiFlags])].join('');
}

function updateExplanation(regex, pattern) {
  explanation.innerHTML = `
    <div class="regex-info">
      <strong>Pattern:</strong> <code>${escapeHtml(pattern)}</code><br>
      <strong>Source:</strong> <code>${escapeHtml(regex.source)}</code><br>
      <strong>Flags:</strong> <code>${regex.flags || 'none'}</code><br>
      <div class="flag-details">
        <span class="${regex.global ? 'active' : ''}">Global</span>
        <span class="${regex.ignoreCase ? 'active' : ''}">Case Insensitive</span>
        <span class="${regex.multiline ? 'active' : ''}">Multiline</span>
        <span class="${regex.sticky ? 'active' : ''}">Sticky</span>
        <span class="${regex.unicode ? 'active' : ''}">Unicode</span>
        <span class="${regex.dotAll ? 'active' : ''}">DotAll</span>
      </div>
    </div>
  `;
}

function noMatchesHTML() {
  return `
    <div class="match-box">
      <div class="match-header">No matches found</div>
      <div class="match-content">The regular expression didn't match any part of the text</div>
    </div>
  `;
}

function showError(e) {
  const errorMessage = e.message.includes('Invalid regular expression') 
    ? `Invalid regex: ${e.message.replace(/^Invalid regular expression: /, '')}`
    : e.message;
  
  explanation.innerHTML = `<div class="error">Error: ${errorMessage}</div>`;
  matchInfo.innerHTML = `
    <div class="match-box error">
      <div class="match-header">Invalid Regular Expression</div>
      <div class="match-content">${errorMessage}</div>
    </div>
  `;
}

// Process matches
function processMatches(regex, text) {
  // Ensure global flag for matchAll
  if (!regex.global) {
    regex = new RegExp(regex.source, regex.flags + 'g');
  }
  
  try {
    matches = [...text.matchAll(regex)];
    
    if (matches.length === 0) {
      matchInfo.innerHTML = noMatchesHTML();
      return;
    }
    
    matchInfo.innerHTML = matches.map((match, index) => {
      const matchText = match[0];
      const [line, column] = getPosition(text, match.index);
      const isActive = index === activeMatchIndex;
      
      return `
        <div class="match-box ${isActive ? 'active' : ''}" 
             data-index="${index}" 
             onclick="highlightMatch(${index})">
          <div class="match-header">
            Match ${index + 1} (Line ${line}, Col ${column})
            <span class="match-length">${matchText.length} chars</span>
          </div>
          <div class="match-content">${escapeHtml(matchText)}</div>
          ${match.length > 1 ? renderGroups(match) : ''}
        </div>
      `;
    }).join('');
  } catch (e) {
    showError(e);
  }
}

function renderGroups(match) {
  return `
    <div class="match-groups">
      Groups: ${match.slice(1).map((g, i) => 
        `<div>Group ${i + 1}: ${g !== undefined ? escapeHtml(g) : '<em>undefined</em>'}</div>`
      ).join('')}
    </div>
  `;
}

function getPosition(text, index) {
  const lines = text.substring(0, index).split('\n');
  return [lines.length, lines[lines.length - 1].length + 1];
}

// Highlight matches in the test string
function highlightMatches(regex, text) {
  // Reset highlighting
  testString.value = text;
  testString.dataset.highlighted = '';
  
  if (!regex.global) {
    regex = new RegExp(regex.source, regex.flags + 'g');
  }
  
  const matches = [...text.matchAll(regex)];
  if (matches.length === 0) return;
  
  let highlighted = text;
  let offset = 0;
  
  matches.forEach((match, i) => {
    const start = match.index + offset;
    const end = start + match[0].length;
    const before = highlighted.substring(0, start);
    const matched = highlighted.substring(start, end);
    const after = highlighted.substring(end);
    
    const highlightClass = i === activeMatchIndex ? 'highlight-active' : 'highlight-match';
    highlighted = `${before}<span class="${highlightClass}">${matched}</span>${after}`;
    offset += `<span class="${highlightClass}"></span>`.length;
  });
  
  testString.dataset.highlighted = highlighted;
}

// Process replace
function processReplace(regex, text) {
  const replaced = text.replace(regex, '<span class="highlight">$&</span>');
  
  matchInfo.innerHTML = `
    <div class="match-box">
      <div class="match-header">Replace Preview</div>
      <div class="match-content">${escapeHtml(text).replace(regex, '<span class="highlight">$&</span>')}</div>
    </div>
  `;
}

// Process split
function processSplit(regex, text) {
  const parts = text.split(regex);
  
  matchInfo.innerHTML = `
    <div class="match-box">
      <div class="match-header">Split Results (${parts.length} parts)</div>
      <div class="match-content">${parts.map((p, i) => 
        `${i}: ${escapeHtml(p)}`).join('\n')}
      </div>
    </div>
  `;
}

// Process test
function processTest(regex, text) {
  const result = regex.test(text);
  
  matchInfo.innerHTML = `
    <div class="match-box">
      <div class="match-header">Test Result</div>
      <div class="match-content">The regular expression ${result ? 
        '<span style="color:#4EC9B0">matched</span>' : 
        '<span style="color:#F44747">did not match</span>'} the text
      </div>
    </div>
  `;
}

// Generate code for selected language
function generateCode() {
  const lang = codeGenLangs.value;
  const pattern = regexPattern.value;
  const flags = currentFlags;
  
  let code = '';
  
  switch(lang) {
    case 'js':
      code = generateJavaScriptCode(pattern, flags);
      break;
    case 'py':
      code = generatePythonCode(pattern, flags);
      break;
    case 'php':
      code = generatePHPCode(pattern, flags);
      break;
    case 'java':
      code = generateJavaCode(pattern, flags);
      break;
    case 'csharp':
      code = generateCSharpCode(pattern, flags);
      break;
    case 'go':
      code = generateGoCode(pattern, flags);
      break;
    case 'ruby':
      code = generateRubyCode(pattern, flags);
      break;
    case 'rust':
      code = generateRustCode(pattern, flags);
      break;
    default:
      code = `// Code generation not available for selected language`;
  }
  
  codeOutput.textContent = code;
}

// Language-specific code generators
function generateJavaScriptCode(pattern, flags) {
  const safePattern = pattern.replace(/\\/g, '\\\\').replace(/\//g, '\\/');
  return `// JavaScript Regex Example
const pattern = /${safePattern}/${flags};
const text = "Your text here";

// Test if pattern matches
const isMatch = pattern.test(text);
console.log("Match result:", isMatch);

// Find all matches
const matches = [...text.matchAll(pattern)];
console.log("Matches:", matches);

// Replace matches
const replaced = text.replace(pattern, "replacement");
console.log("Replaced text:", replaced);

// Split by pattern
const parts = text.split(pattern);
console.log("Split parts:", parts);`;
}

function generatePythonCode(pattern, flags) {
  const safePattern = pattern.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const pyFlags = [];
  if (flags.includes('i')) pyFlags.push('re.IGNORECASE');
  if (flags.includes('m')) pyFlags.push('re.MULTILINE');
  if (flags.includes('s')) pyFlags.push('re.DOTALL');
  
  const flagsStr = pyFlags.join(' | ') || '0';
  
  return `# Python Regex Example
import re

pattern = re.compile(r'${safePattern}', ${flagsStr})
text = "Your text here"

# Test if pattern matches
is_match = bool(re.search(pattern, text))
print("Match result:", is_match)

# Find all matches
matches = re.findall(pattern, text)
print("Matches:", matches)

# For capturing groups, use finditer
for match in re.finditer(pattern, text):
  print("Match:", match.group(), "at position", match.start())

# Replace matches
replaced = re.sub(pattern, "replacement", text)
print("Replaced text:", replaced)

# Split by pattern
parts = re.split(pattern, text)
print("Split parts:", parts)`;
}

function generatePHPCode(pattern, flags) {
  const safePattern = pattern.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `<?php
// PHP Regex Example
$pattern = '/${safePattern}/${flags}';
$text = "Your text here";

// Test if pattern matches
$is_match = preg_match($pattern, $text);
echo "Match result: " . ($is_match ? 'true' : 'false') . PHP_EOL;

// Find all matches
preg_match_all($pattern, $text, $matches);
print_r($matches);

// Replace matches
$replaced = preg_replace($pattern, "replacement", $text);
echo "Replaced text: " . $replaced . PHP_EOL;

// Split by pattern
$parts = preg_split($pattern, $text);
print_r($parts);
?>`;
}

function generateJavaCode(pattern, flags) {
  const safePattern = pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const javaFlags = [];
  if (flags.includes('i')) javaFlags.push('Pattern.CASE_INSENSITIVE');
  if (flags.includes('m')) javaFlags.push('Pattern.MULTILINE');
  if (flags.includes('s')) javaFlags.push('Pattern.DOTALL');
  
  const flagsStr = javaFlags.join(' | ') || '0';
  
  return `// Java Regex Example
import java.util.regex.*;

public class Main {
  public static void main(String[] args) {
      String pattern = "${safePattern}";
      String text = "Your text here";
      
      // Create Pattern with flags
      Pattern p = Pattern.compile(pattern, ${flagsStr});
      Matcher m = p.matcher(text);
      
      // Test if pattern matches
      boolean isMatch = m.find();
      System.out.println("Match result: " + isMatch);
      
      // Find all matches
      m.reset();
      while (m.find()) {
          System.out.println("Match: " + m.group() + " at position " + m.start());
          
          // Print groups if any
          for (int i = 1; i <= m.groupCount(); i++) {
              System.out.println("  Group " + i + ": " + m.group(i));
          }
      }
      
      // Replace matches
      String replaced = text.replaceAll(pattern, "replacement");
      System.out.println("Replaced text: " + replaced);
      
      // Split by pattern
      String[] parts = text.split(pattern);
      System.out.println("Split parts: " + Arrays.toString(parts));
  }
}`;
}

function generateCSharpCode(pattern, flags) {
  const safePattern = pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const csFlags = [];
  if (flags.includes('i')) csFlags.push('RegexOptions.IgnoreCase');
  if (flags.includes('m')) csFlags.push('RegexOptions.Multiline');
  if (flags.includes('s')) csFlags.push('RegexOptions.Singleline');
  
  const flagsStr = csFlags.join(' | ') || 'RegexOptions.None';
  
  return `// C# Regex Example
using System;
using System.Text.RegularExpressions;

class Program {
  static void Main() {
      string pattern = @"${safePattern}";
      string text = "Your text here";
      
      // Create Regex with options
      Regex regex = new Regex(pattern, ${flagsStr});
      
      // Test if pattern matches
      bool isMatch = regex.IsMatch(text);
      Console.WriteLine("Match result: " + isMatch);
      
      // Find all matches
      MatchCollection matches = regex.Matches(text);
      foreach (Match match in matches) {
          Console.WriteLine("Match: " + match.Value + " at position " + match.Index);
          
          // Print groups if any
          for (int i = 1; i < match.Groups.Count; i++) {
              Console.WriteLine("  Group " + i + ": " + match.Groups[i].Value);
          }
      }
      
      // Replace matches
      string replaced = regex.Replace(text, "replacement");
      Console.WriteLine("Replaced text: " + replaced);
      
      // Split by pattern
      string[] parts = regex.Split(text);
      Console.WriteLine("Split parts: " + string.Join(", ", parts));
  }
}`;
}

function generateGoCode(pattern, flags) {
  const safePattern = pattern.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
  return `// Go Regex Example
package main

import (
  "fmt"
  "regexp"
)

func main() {
  pattern := \`${safePattern}\`
  text := "Your text here"
  
  // Compile regex with flags
  re := regexp.MustCompile(pattern)
  
  // Test if pattern matches
  isMatch := re.MatchString(text)
  fmt.Println("Match result:", isMatch)
  
  // Find all matches
  matches := re.FindAllString(text, -1)
  fmt.Println("Matches:", matches)
  
  // Find all matches with positions
  for _, match := range re.FindAllStringSubmatchIndex(text, -1) {
      fmt.Println("Match:", text[match[0]:match[1]], "at position", match[0])
  }
  
  // Replace matches
  replaced := re.ReplaceAllString(text, "replacement")
  fmt.Println("Replaced text:", replaced)
  
  // Split by pattern
  parts := re.Split(text, -1)
  fmt.Println("Split parts:", parts)
}`;
}

function generateRubyCode(pattern, flags) {
  const safePattern = pattern.replace(/\\/g, '\\\\').replace(/\//g, '\\/');
  return `# Ruby Regex Example
pattern = /${safePattern}/${flags}
text = "Your text here"

# Test if pattern matches
is_match = !!(text =~ pattern)
puts "Match result: #{is_match}"

# Find all matches
matches = text.scan(pattern)
puts "Matches: #{matches.inspect}"

# Find all matches with positions
text.scan(pattern) do |match|
  puts "Match: #{match} at position #{Regexp.last_match.offset(0).first}"
end

# Replace matches
replaced = text.gsub(pattern, "replacement")
puts "Replaced text: #{replaced}"

# Split by pattern
parts = text.split(pattern)
puts "Split parts: #{parts.inspect}"`;
}

function generateRustCode(pattern, flags) {
  const safePattern = pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const rustFlags = [];
  if (flags.includes('i')) rustFlags.push("(?i)");
  if (flags.includes('m')) rustFlags.push("(?m)");
  if (flags.includes('s')) rustFlags.push("(?s)");
  
  const flagsPrefix = rustFlags.join('');
  
  return `// Rust Regex Example
use regex::Regex;

fn main() {
  let pattern = r"${flagsPrefix}${safePattern}";
  let text = "Your text here";
  
  // Create Regex
  let re = Regex::new(pattern).unwrap();
  
  // Test if pattern matches
  let is_match = re.is_match(text);
  println!("Match result: {}", is_match);
  
  // Find all matches
  for cap in re.captures_iter(text) {
      println!("Match: {} at position {:?}", &cap[0], cap.get(0).map(|m| m.start()));
      
      // Print groups if any
      for i in 1..cap.len() {
          if let Some(group) = cap.get(i) {
              println!("  Group {}: {}", i, group.as_str());
          }
      }
  }
  
  // Replace matches
  let replaced = re.replace_all(text, "replacement");
  println!("Replaced text: {}", replaced);
  
  // Split by pattern
  let parts: Vec<&str> = re.split(text).collect();
  println!("Split parts: {:?}", parts);
}`;
}

// Helper to escape HTML
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, '<br>')
    .replace(/ /g, '&nbsp;');
}

// Flavor configurations with detailed flags
const flavorConfigs = {
  pcre2: {
    name: "PCRE2 (PHP>=7.3)",
    flags: {
      g: { name: "Global - Don't return after first match", default: true },
      m: { name: "Multi line - ^ and $ match start/end of line", default: true },
      i: { name: "Insensitive - Case insensitive match", default: false },
      s: { name: "Single line - Dot matches newline", default: false },
      u: { name: "Unicode - Match with full unicode", default: false },
      U: { name: "Ungreedy - Make quantifiers lazy", default: false },
      A: { name: "Anchored - Anchor to start of pattern", default: false },
      J: { name: "Jchanged - Allow duplicate subpattern names", default: false },
      D: { name: "Dollar end only - $ matches only end of pattern", default: false }
    }
  },
  pcre: {
    name: "PCRE (PHP<7.3)",
    flags: {
      g: { name: "Global - Don't return after first match", default: true },
      m: { name: "Multi line - ^ and $ match start/end of line", default: true },
      i: { name: "Insensitive - Case insensitive match", default: false },
      x: { name: "Extended - Ignore whitespace", default: false },
      X: { name: "eXtra - Disallow meaningless escapes", default: false },
      s: { name: "Single line - Dot matches newline", default: false },
      u: { name: "Unicode - Match with full unicode", default: false },
      U: { name: "Ungreedy - Make quantifiers lazy", default: false },
      A: { name: "Anchored - Anchor to start of pattern", default: false },
      J: { name: "Jchanged - Allow duplicate subpattern names", default: false },
      D: { name: "Dollar end only - $ matches only end of pattern", default: false }
    }
  },
  ecmascript: {
    name: "ECMAScript (JavaScript)",
    flags: {
      g: { name: "Global - Don't return after first match", default: true },
      m: { name: "Multi line - ^ and $ match start/end of line", default: true },
      i: { name: "Insensitive - Case insensitive match", default: false },
      y: { name: "Sticky - Anchor to start of pattern", default: false },
      u: { name: "Unicode - Match with full unicode", default: false },
      v: { name: "vnicode - Enable all unicode features", default: false },
      s: { name: "Single line - Dot matches newline", default: false },
      d: { name: "Indices - Return match indices", default: false }
    }
  },
  python: {
    name: "Python",
    flags: {
      g: { name: "Global - Don't return after first match", default: true },
      m: { name: "Multi line - ^ and $ match start/end of line", default: true },
      i: { name: "Insensitive - Case insensitive match", default: false },
      x: { name: "Extended - Ignore whitespace", default: false },
      s: { name: "Single line - Dot matches newline", default: false },
      u: { name: "Unicode - Match with full unicode", default: false },
      a: { name: "ASCII - ASCII-only matching", default: false }
    }
  },
  golang: {
    name: "Golang",
    flags: {
      g: { name: "Global - Don't return after first match", default: true },
      m: { name: "Multi line - ^ and $ match start/end of line", default: true },
      i: { name: "Insensitive - Case insensitive match", default: false },
      s: { name: "Single line - Dot matches newline", default: false },
      U: { name: "Ungreedy - Make quantifiers lazy", default: false }
    }
  },
  java8: {
    name: "Java 8",
    flags: {
      g: { name: "Global - Don't return after first match", default: true },
      m: { name: "Multi line - ^ and $ match start/end of line", default: true },
      i: { name: "Insensitive - Case insensitive match", default: false },
      s: { name: "Single line - Dot matches newline", default: false },
      x: { name: "Extended - Ignore whitespace", default: false },
      u: { name: "Unicode case - Case insensitive unicode", default: false },
      U: { name: "Unicode matching - Enable unicode support", default: false },
      d: { name: "Line-feed only - Limit to \\n", default: false }
    }
  },
  dotnet: {
    name: ".NET 7.0 (C#)",
    flags: {
      g: { name: "Global - Don't return after first match", default: true },
      i: { name: "Insensitive - Case insensitive match", default: false },
      m: { name: "Multi line - ^ and $ match start/end of line", default: true },
      s: { name: "Single line - Dot matches newline", default: false },
      n: { name: "Non-capturing - Groups are non-capturing", default: false },
      x: { name: "Extended - Ignore whitespace", default: false },
      r: { name: "Right to left - Match from right to left", default: false },
      b: { name: "No backtracking - Disable backtracking", default: false }
    }
  },
  rust: {
    name: "Rust",
    flags: {
      g: { name: "Global - Don't return after first match", default: true },
      m: { name: "Multi line - ^ and $ match start/end of line", default: true },
      i: { name: "Insensitive - Case insensitive match", default: false },
      s: { name: "Single line - Dot matches newline", default: false },
      U: { name: "Ungreedy - Make quantifiers lazy", default: false },
      x: { name: "Extended - Ignore whitespace", default: false }
    }
  }
};

// Global functions
window.highlightMatch = function(index) {
  activeMatchIndex = index;
  const match = matches[index];
  
  if (match) {
    // Scroll to match
    const lineHeight = 20;
    const linesBefore = testString.value.substring(0, match.index).split('\n').length - 1;
    testString.scrollTop = linesBefore * lineHeight;
    
    // Update UI
    document.querySelectorAll('.match-box').forEach((box, i) => {
      box.classList.toggle('active', i === index);
    });
    
    // Re-highlight with active match
    const regex = new RegExp(regexPattern.value, currentFlags + 'g');
    highlightMatches(regex, testString.value);
  }
};

window.clearRegex = clearRegex;
window.clearTestString = clearTestString;
window.copyMatches = copyMatches;
window.copyGeneratedCode = copyGeneratedCode;
window.showFlavorInfo = showFlavorInfo;
window.showAbout = showAbout;
window.shareToTwitter = shareToTwitter;
window.shareToTelegram = shareToTelegram;
window.copyUrl = copyUrl;