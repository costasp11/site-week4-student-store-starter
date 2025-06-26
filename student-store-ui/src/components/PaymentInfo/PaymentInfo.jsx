import "./PaymentInfo.css"

export default function PaymentInfo({ userInfo, setUserInfo, handleOnCheckout, isCheckingOut, error }) {
  return (
    <div className="PaymentInfo">
      <h3 className="">
        Payment Info{" "}
        <span className="button">
          <i className="material-icons md-48">monetization_on</i>
        </span>
      </h3>
      <div className="input-field">
        <label className="label">Name *</label>
        <div className="control ">
          <input
            className="input"
            type="text"
            placeholder="Name"
            value={userInfo.name}
            onChange={(e) => setUserInfo((u) => ({ ...u, name: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="input-field">
        <label className="label">Email *</label>
        <div className="control">
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={userInfo.email}
            onChange={(e) => setUserInfo((u) => ({ ...u, email: e.target.value }))}
            required
          />
        </div>
      </div>

      {/* <div className="field">
        <div className="control">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={userInfo.termsAndConditions}
              onChange={(e) => setUserInfo((u) => ({ ...u, termsAndConditions: !u.termsAndConditions }))}
            />
            <span className="label">
              I agree to the <a href="#terms-and-conditions">terms and conditions</a>
            </span>
          </label>
        </div>
      </div> */}

      {error && <p className="is-danger">⚠️ {error}</p>}

      <div className="field">
        <div className="control">
          <button 
            className="button" 
            disabled={isCheckingOut} 
            onClick={() => {
              console.log('🛒 Submit button clicked!');
              console.log('👤 User info:', userInfo);
              console.log('📦 Cart items:', Object.keys(userInfo).length > 0 ? 'Has items' : 'Empty');
              handleOnCheckout();
            }}
          >
            {isCheckingOut ? 'Processing...' : 'Submit Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
