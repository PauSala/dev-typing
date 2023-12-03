import { VFC, useRef, useState, useEffect } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import styles from "./Editor.module.css";

export const Editor = ({
  errorHandler,
  correctHandler,
  startHandler,
  endHandler,
  saveCurrentModelHandler,
  model,
  lang
}: {
  startHandler: () => void;
  endHandler: () => void;
  errorHandler: () => void;
  correctHandler: () => void;
  saveCurrentModelHandler: (model: string) => void;
  model: string;
  lang: string
}) => {

  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoEl = useRef(null);

  useEffect(() => {
    if (monacoEl) {
      setEditor((editor) => {
        if (editor) return editor;

        return monaco.editor.create(monacoEl.current!, {
          value: model,
          language: lang,
          cursorStyle: "underline-thin",
          readOnly: false,
          codeLens: false,
          lineNumbers: "on",
          theme: "vs-dark",
          minimap: { enabled: false },
          automaticLayout: false,
        });
      });
    }

    editor?.onDidPaste(() => {
      editor.focus();
      editor.setPosition({ column: 1, lineNumber: 1 });
      editor.updateOptions({ readOnly: false });
      saveCurrentModelHandler(
        editor.getModel()?.getLinesContent().join("\n") || ""
      );
      startHandler();
    });

    editor?.onKeyDown((event) => {
      if (editor.getOption(81) === true) {
        return;
      }
      const currentModel = editor.getModel();
      const currentPosition = editor.getPosition();
      const line =
        editor.getModel()?.getLineContent(currentPosition?.lineNumber || 0) ||
        "";
      const char = line[(currentPosition?.column || 0) - 1];
      if (monaco.KeyCode.Delete === event.keyCode) {
        return;
      }
      if (
        currentPosition &&
        currentPosition.column === 1 &&
        currentPosition.lineNumber === 1
      ) {
        startHandler();
      }
      if (
        [
          monaco.KeyCode.Backspace,
          monaco.KeyCode.UpArrow,
          monaco.KeyCode.DownArrow,
          monaco.KeyCode.LeftArrow,
          monaco.KeyCode.RightArrow,
          monaco.KeyCode.Tab
        ].includes(event.keyCode)
      ) {
        event.preventDefault();
        event.stopPropagation();
      } else if (event.keyCode === monaco.KeyCode.Shift) {
        event.preventDefault();
      } else if (
        event.keyCode === monaco.KeyCode.Enter &&
        editor.getModel()?.getLineLength(currentPosition?.lineNumber || 0) ===
          (currentPosition?.column || 0) - 1
      ) {
        event.preventDefault();

        // Get the current position
        if (currentPosition) {
          // Get the current line's text
          const currentLineText = currentModel?.getLineContent(
            currentPosition.lineNumber + 1
          );

          // Calculate the indentation of the current line
          const indentation = /^\s*/.exec(currentLineText || "")?.[0] || "";

          // Move the cursor to the appropriate position
          const newColumn = indentation.length + 1;
          editor.setPosition({
            lineNumber: currentPosition.lineNumber + 1,
            column: newColumn,
          });
        }
      } else {
        if (currentPosition) {
          // Define the style for the decorator (you can customize colors, fonts, etc.)
          const decoration = {
            range: new monaco.Range(
              currentPosition.lineNumber,
              currentPosition.column,
              currentPosition.lineNumber,
              currentPosition.column + 1
            ),
            options: {
              inlineClassName: "custom-color", // CSS class for styling
              stickiness: 1,
            },
          };
          const decoration2 = {
            range: new monaco.Range(
              currentPosition.lineNumber,
              currentPosition.column,
              currentPosition.lineNumber,
              currentPosition.column + 1
            ),
            options: {
              inlineClassName: "custom-color-2", // CSS class for styling
              stickiness: 1,
            },
          };

          // Apply the decorator
          if (char === event.browserEvent.key) {
            correctHandler();
            editor.deltaDecorations([], [decoration]);
          } else {
            errorHandler();
            editor.deltaDecorations([], [decoration2]);
          }
        }
        event.preventDefault();
        let { column, lineNumber } = editor.getPosition() || {
          column: 0,
          lineNumber: 0,
        };
        editor.setPosition({ column: column + 1, lineNumber: lineNumber });
        let end = editor?.getModel()?.getFullModelRange();
        let newPosition = editor.getPosition();
        if (
          end &&
          newPosition &&
          end.endColumn === newPosition.column &&
          end.endLineNumber === newPosition.lineNumber
        ) {
          editor.updateOptions({ readOnly: true });
          endHandler();
        }
      }
    });
    editor?.focus();
    editor?.setPosition({ column: 1, lineNumber: 1 });
    editor;

    return () => editor?.dispose();
  }, [monacoEl.current]);

  return <div className={styles.Editor} ref={monacoEl}></div>;
};
