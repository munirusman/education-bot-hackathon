Modal dialog with scrim; title states the action, description states the consequence.
```jsx
<Dialog title="Pause Maya’s tutor?" description="Maya will see “Your teacher paused the tutor.” You can resume anytime." onClose={close}
  actions={<><Button variant="secondary" onClick={close}>Cancel</Button><Button variant="danger" icon="pause">Pause tutor</Button></>}/>
```
