document.addEventListener('DOMContentLoaded', function () {
   const notepad = document.getElementById('notepad');
   const saveBtn = document.getElementById('saveBtn');
   const saveAsBtn = document.getElementById('saveAsBtn');
   const openBtn = document.getElementById('openBtn');
   const clearBtn = document.getElementById('clearBtn');
   const searchInput = document.getElementById('searchInput');
   const searchBtn = document.getElementById('searchBtn');
   const replaceBtn = document.getElementById('replaceBtn');
   const syntaxSelect = document.getElementById('syntaxSelect');
   const darkModeToggle = document.getElementById('darkModeToggle');
   const lineNumbers = document.getElementById('lineNumbers');
   const panel = document.getElementById('panel');
   const printBtn = document.getElementById('printBtn');
   const wordCountDisplay = document.getElementById('wordCountDisplay');

   let autoSaveTimeout;

   printBtn.addEventListener('click', function () {
      window.print();
   });

   notepad.addEventListener('input', function () {
      updateLineNumbers();
      highlightSyntax();
      startAutoSaveTimer();
      updateWordCount();
  });

  function updateWordCount() {
      const words = notepad.value.split(/\s+/).filter(function (word) {
          return word.length > 0;
      }).length;
      wordCountDisplay.textContent = `Word Count: ${words}`;
  }

  wordCountDisplay.addEventListener('click', function () {
      updateWordCount();
  });

   function startAutoSaveTimer() {
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(function () {
         // Save the content after a delay (e.g., every 30 seconds)
         saveToFile(currentFileName || 'autosave.txt');
      }, 30000); // 30 seconds
   }

   let currentFileName = null;
   let darkModeEnabled = false;

   syntaxSelect.addEventListener('change', function () {
       notepad.className = 'syntax-' + syntaxSelect.value;
       highlightSyntax();
   });

   darkModeToggle.addEventListener('click', function () {
      darkModeEnabled = !darkModeEnabled;
      applyDarkMode();
   });

   notepad.addEventListener('input', function () {
       updateLineNumbers();
       highlightSyntax();
   });

   notepad.addEventListener('keydown', function (e) {
       if (e.key === 'Tab') {
           e.preventDefault();
           const start = notepad.selectionStart;
           const end = notepad.selectionEnd;

           // Insert 4 spaces at the current cursor position
           notepad.value = notepad.value.substring(0, start) + '    ' + notepad.value.substring(end);

           // Move the cursor to the end of the inserted spaces
           notepad.setSelectionRange(start + 4, start + 4);
       }
   });

   notepad.addEventListener('mousedown', function (e) {
       if (e.ctrlKey) {
           const lineNumber = getLineNumberFromClick(e.clientY);
           toggleBookmark(lineNumber);
       }
   });

   function toggleBookmark(lineNumber) {
       const existingBookmark = panel.querySelector(`.bookmark[data-line="${lineNumber}"]`);
       if (existingBookmark) {
           existingBookmark.remove();
       } else {
           const bookmark = document.createElement('div');
           bookmark.classList.add('bookmark');
           bookmark.dataset.line = lineNumber;
           bookmark.textContent = '🔖';
           panel.appendChild(bookmark);
       }
   }

   function getLineNumberFromClick(clientY) {
       const rect = notepad.getBoundingClientRect();
       const lineHeight = notepad.scrollHeight / notepad.rows;
       const lineNumber = Math.floor((clientY - rect.top) / lineHeight) + 1;
       return lineNumber;
   }

   function applyDarkMode() {
       document.body.classList.toggle('dark-mode', darkModeEnabled);
       notepad.style.backgroundColor = darkModeEnabled ? '#333' : '';
       notepad.style.color = darkModeEnabled ? '#ccc' : '';
       notepad.style.caretColor = darkModeEnabled ? 'white' : '';
       notepad.style.borderColor = darkModeEnabled ? '#444' : '';
       notepad.style.boxShadow = darkModeEnabled ? '0 0 10px rgba(255, 85, 85, 0.1)' : '0 0 10px rgba(0, 0, 0, 0.1)';
       notepad.className = darkModeEnabled ? 'syntax-' + syntaxSelect.value : '';
       lineNumbers.style.backgroundColor = darkModeEnabled ? '#1e1e1e' : '#ecf0f1';
       lineNumbers.style.borderRight = darkModeEnabled ? '1px solid #444' : '1px solid #bdc3c7';
       document.querySelector('.notepad-container').style.backgroundColor = darkModeEnabled ? '#1e1e1e' : '#f0f0f0';
       document.querySelector('.notepad-container').style.color = darkModeEnabled ? '#ff5555' : '';
       document.querySelectorAll('.toolbar button').forEach(button => {
           button.style.backgroundColor = darkModeEnabled ? '#2ecc71' : '#3498db';
           button.style.color = darkModeEnabled ? 'white' : 'white';
       });
   }

   function updateLineNumbers() {
      const lines = notepad.value.split('\n').length;
      lineNumbers.innerHTML = '';
      for (let i = 1; i <= lines; i++) {
          lineNumbers.innerHTML += `<div>${i}</div>`;
      }
  }

  

   function highlightSyntax() {
       const content = notepad.value;
       const lines = content.split('\n');
       const highlightedLines = lines.map((line) => {
           return line.replace(/<[^>]+>/g, (match) => {
               return `<span class="tag">${match}</span>`;
           }).replace(/(\w+)="([^"]+)"/g, (match, attribute, value) => {
               return `<span class="attribute">${attribute}</span>=<span class="value">"${value}"</span>`;
           }).replace(/<!--.*?-->/g, (match) => {
               return `<span class="comment">${match}</span>`;
           });
       });

       notepad.innerHTML = highlightedLines.join('\n');
   }

   
   saveBtn.addEventListener('click', function () {
       if (currentFileName) {
           saveToFile(currentFileName);
       } else {
           saveAs();
       }
   });

   saveAsBtn.addEventListener('click', function () {
       saveAs();
   });

   openBtn.addEventListener('click', function () {
       const input = document.createElement('input');
       input.type = 'file';
       input.accept = '.txt, .html'; // Specify the file types you want to allow
       input.addEventListener('change', function (event) {
           const file = event.target.files[0];
           if (file) {
               currentFileName = file.name;
               const reader = new FileReader();
               reader.onload = function () {
                   notepad.value = reader.result;
                   updateLineNumbers();
                   highlightSyntax();
               };
               reader.readAsText(file);
           }
       });
       input.click();
   });

   clearBtn.addEventListener('click', function () {
       notepad.value = '';
       updateLineNumbers();
   });

   searchBtn.addEventListener('click', function () {
       const searchTerm = searchInput.value;
       const content = notepad.value;
       const regex = new RegExp(searchTerm, 'g');
       const matchCount = (content.match(regex) || []).length;
       alert(`Found ${matchCount} matches for "${searchTerm}".`);
   });

   replaceBtn.addEventListener('click', function () {
       const searchTerm = searchInput.value;
       const replaceTerm = prompt('Replace with:');
       const content = notepad.value;
       const regex = new RegExp(searchTerm, 'g');
       const updatedContent = content.replace(regex, replaceTerm);
       notepad.value = updatedContent;
       updateLineNumbers();
   });

   function saveAs() {
       const fileName = prompt('Enter a filename:');
       if (fileName) {
           currentFileName = fileName;
           saveToFile(fileName);
       }
   }

   function saveToFile(fileName) {
       const content = notepad.value;
       const blob = new Blob([content], { type: 'text/plain' });
       const a = document.createElement('a');
       a.href = URL.createObjectURL(blob);
       a.download = fileName;
       a.click();
   }

   function undo() {
      notepad.value = undoStack.pop() || '';
      updateLineNumbers();
  }

  function redo() {
      notepad.value = redoStack.pop() || '';
      updateLineNumbers();
  }

});
