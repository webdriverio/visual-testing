import React from "react";
import { MethodData } from "../types";
import BrowserIcon, { BrowserName } from "./BrowserIcon";
import PlatformIcon, { PlatformName } from "./PlatformIcon";
import styles from "./OverlayHeader.module.css";

interface OverlayHeaderProps {
  data: MethodData;
  onClose: () => void;
  currentChange: number;
  totalChanges: number;
  onPrevChange: () => void;
  onNextChange: () => void;
}

const OverlayHeader: React.FC<OverlayHeaderProps> = ({
  data,
  onClose,
  currentChange,
  totalChanges,
  onPrevChange,
  onNextChange,
}) => {
  const {
    description,
    instanceData: { browser, deviceName, platform },
    tag,
    test,
  } = data;
  const notKnown = "not-known";
  const browserName = browser?.name || notKnown;
  const browserVersion =
    browser?.version === "not-known" ? notKnown : browser?.version;
  const device = deviceName || notKnown;
  const platformVersion = platform.version || notKnown;

  return (
    <header className={styles.header}>
      <div className={styles.headerTextWrapper}>
        <div className={styles.headerContent}>
          <div className={styles.testContainer}>
            <div className={styles.description}>
              <h3>{description}</h3>
            </div>
            <div className={styles.test}>
              <p>
                {test} | {tag}
              </p>
            </div>
          </div>
          <div className={styles.controls}>
            {totalChanges > 0 && (
              <>
                <button onClick={onPrevChange}>&lt;</button>
                <span>
                  {currentChange === -1
                    ? `All ${totalChanges} changes`
                    : `${currentChange + 1} / ${totalChanges} changes`}
                </span>
                <button onClick={onNextChange}>&gt;</button>
              </>
            )}
          </div>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>
      <div className={styles.instanceDataWrapper}>
        <div className={styles.baselineContainer}>
          <h3>Baseline:</h3>
          <PlatformIcon platformName={platform.name as PlatformName} />
          {platformVersion !== notKnown && (
            <>
              <span className={styles.divider} /> {platformVersion}
            </>
          )}
          <span className={styles.divider}>|</span>
          <BrowserIcon
            className={styles.browserIcon}
            browserName={browserName as BrowserName}
          />
          {browserVersion !== notKnown && (
            <>
              <span className={styles.divider} /> {browserVersion}
            </>
          )}
          {device !== notKnown && (
            <>
              <span className={styles.divider}>|</span> {device}
            </>
          )}
        </div>
        <div className={styles.actualContainer}>
          <h3>Actual:</h3>
          <PlatformIcon platformName={platform.name as PlatformName} />
          <span className={styles.divider} />
          {platformVersion !== notKnown && (
            <>
              <span className={styles.divider} /> {platformVersion}
            </>
          )}
          <span className={styles.divider}>|</span>
          <BrowserIcon
            className={styles.browserIcon}
            browserName={browserName as BrowserName}
          />
          {browserVersion !== notKnown && (
            <>
              <span className={styles.divider} /> {browserVersion}
            </>
          )}
          {device !== notKnown && (
            <>
              <span className={styles.divider}>|</span> {device}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default OverlayHeader;
