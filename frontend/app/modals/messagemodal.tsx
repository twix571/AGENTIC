// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { Modal } from "@/app/modals/modal";
import { modalsModel } from "@/app/store/modalmodel";

import { ReactNode } from "react";
import * as React from "react";
import "./messagemodal.scss";

const MessageModal = ({ children }: { children: ReactNode }) => {
    function closeModal() {
        modalsModel.popModal();
    }

    return (
        <Modal className="message-modal" onOk={() => closeModal()} onClose={() => closeModal()}>
            {children}
        </Modal>
    );
};

MessageModal.displayName = "MessageModal";

export { MessageModal };

export type SetDefaultPathModalProps = {
    currentCwd: string;
    existingDefaultCwd: string;
    onConfirm: (path: string, isProjectLevel: boolean) => void;
};

const SetDefaultPathModal = (props: SetDefaultPathModalProps) => {
    const [inputPath, setInputPath] = React.useState("");
    const [isProjectLevel, setIsProjectLevel] = React.useState(false);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        setInputPath(props.existingDefaultCwd || props.currentCwd);
        setIsProjectLevel(!!props.existingDefaultCwd);
    }, [props]);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                const normalizedPath = inputPath.trim();
                if (!normalizedPath) {
                    setError("Please enter a path");
                    return;
                }
                props.onConfirm(normalizedPath, isProjectLevel);
                modalsModel.popModal();
            }
            if (event.key === "Escape") {
                modalsModel.popModal();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [inputPath, isProjectLevel, props]);

    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, []);

    const handleConfirm = () => {
        if (!inputPath.trim()) {
            setError("Please enter a path");
            return;
        }

        const normalizedPath = inputPath.trim();
        props.onConfirm(normalizedPath, isProjectLevel);
        modalsModel.popModal();
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-col items-center justify-center p-5 gap-4 min-w-[500px] min-h-[300px]"
        >
            <div className="text-lg font-semibold">Set Default Terminal Path</div>
            <div className="text-sm text-primary/80 max-w-[400px]">
                {isProjectLevel
                    ? "Set this path as the default for ALL terminals in this project. This will be stored in the project configuration."
                    : "Set this path as the default for this terminal only. This will be stored in the block metadata."}
            </div>

            <input
                type="text"
                value={inputPath}
                onChange={(e) => {
                    setInputPath(e.target.value);
                    setError("");
                }}
                placeholder="/path/to/dir"
                className="w-full bg-panel rounded-md border border-border py-2 px-4 min-h-[40px] text-inherit cursor-text focus:ring-2 focus:ring-accent focus:outline-none font-mono"
            />

            {error && (
                <div className="text-sm text-red-400">{error}</div>
            )}

            <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={isProjectLevel}
                        onChange={(e) => setIsProjectLevel(e.target.checked)}
                        className="accent-accent"
                    />
                    <span className="text-sm text-primary">Set for all terminals in project</span>
                </label>
            </div>

            <div className="flex gap-3 mt-4">
                <button
                    onClick={() => modalsModel.popModal()}
                    className="px-4 py-2 rounded-md border border-border hover:bg-panel/50 transition-colors text-sm"
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    className="px-4 py-2 rounded-md bg-accent hover:bg-accent/90 transition-colors text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!inputPath.trim()}
                >
                    Set Default Path
                </button>
            </div>
        </div>
    );
};

SetDefaultPathModal.displayName = "SetDefaultPathModal";

export { SetDefaultPathModal };
