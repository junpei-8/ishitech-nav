import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';

function FakeSession({ children }: PropsWithChildren<any>) {
  const [hasLoggedIn, setHasLoggedIn] = useState<boolean>();
  const [hasFailed, setHasFailed] = useState<boolean>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasLoggedIn(!!window.localStorage.getItem('hasLoggedIn'))
  }, [])

  const onSubmit = (event: Event) => {
    event.preventDefault();

    const inputEl = inputRef.current;
    if (!inputEl) { return; }

    if (inputEl.value === 'けんにんふとう') {
      setHasLoggedIn(true);
      window.localStorage.setItem('hasLoggedIn', 'true');

    } else {
      setHasFailed(true);
    }
  }

  return (
    hasLoggedIn
      ? children
      : 
        <div className="Fake-session">
          <form className="Fake-session-form" onSubmit={onSubmit as any}>
            <div className="Fake-session-form-field">
              <label className="Fake-session-label">認証コード*</label>
              <input className="Fake-session-input" type="text" ref={inputRef} required />
              <span className="Fake-session-underline"></span>
              {
                hasFailed
                  ? <span className="Fake-session-error-label">入力されたコードに誤りがあります</span>
                  : null
              }
            </div>

            <button className="Fake-session-button" type="submit">決定</button>
          </form>
        </div>
  );
}

export default FakeSession;
