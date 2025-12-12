/* Add these styles to the existing CSS */

/* Currency Modal */
.currency-modal .modal-body {
    max-height: 400px;
    overflow-y: auto;
}

.currency-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
    margin: 20px 0;
}

.currency-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
}

.currency-option:hover {
    border-color: var(--secondary-color);
    background: var(--bg-secondary);
}

.currency-option.selected {
    border-color: var(--secondary-color);
    background: var(--bg-secondary);
}

.currency-flag {
    font-size: 1.5rem;
}

.currency-code {
    font-weight: 600;
    font-size: 0.9rem;
}

.currency-name {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 2px;
}

.exchange-rate-info {
    background: var(--bg-secondary);
    padding: 15px;
    border-radius: 10px;
    margin-top: 20px;
    border: 1px solid var(--border-color);
}

.exchange-rate-info h4 {
    margin-bottom: 15px;
    font-size: 1rem;
}

.rate-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-color);
    font-size: 0.9rem;
}

.rate-item:last-child {
    border-bottom: none;
}

.update-btn {
    width: 100%;
    padding: 12px;
    background: var(--secondary-color);
    color: white;
    border: none;
    border-radius: 8px;
    margin: 15px 0 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.3s;
}

.update-btn:hover {
    background: var(--primary-color);
    transform: translateY(-2px);
}

.exchange-rate-info small {
    display: block;
    text-align: center;
    margin-top: 10px;
    color: var(--text-secondary);
    font-size: 0.8rem;
}
