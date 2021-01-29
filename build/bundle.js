
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    // convert rgb to hsl
    const rgbToHsl = (c) => {
      var r = c[0]/255, g = c[1]/255, b = c[2]/255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;

      if(max == min) {
        h = s = 0; // achromatic
      } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return new Array(h * 360, s * 100, l * 100);
    };

    // nes color palette
    const nespalette = [
      {hex: '00', rgb: [124,124,124]},
      {hex: '01', rgb: [0,0,252]},
      {hex: '02', rgb: [0,0,188]},
      {hex: '03', rgb: [68,40,188]},
      {hex: '04', rgb: [148,0,132]},
      {hex: '05', rgb: [168,0,32]},
      {hex: '06', rgb: [168,16,0]},
      {hex: '07', rgb: [136,20,0]},
      {hex: '08', rgb: [80,48,0]},
      {hex: '09', rgb: [0,120,0]},
      {hex: '0A', rgb: [0,104,0]},
      {hex: '0B', rgb: [0,88,0]},
      {hex: '0C', rgb: [0,64,88]},
      {hex: '0D', rgb: [0,0,0]},
      {hex: '0E', rgb: [0,0,0]},
      {hex: '0F', rgb: [0,0,0]},
      {hex: '10', rgb: [188,188,188]},
      {hex: '11', rgb: [0,120,248]},
      {hex: '12', rgb: [0,88,248]},
      {hex: '13', rgb: [104,68,252]},
      {hex: '14', rgb: [216,0,204]},
      {hex: '15', rgb: [228,0,88]},
      {hex: '16', rgb: [248,56,0]},
      {hex: '17', rgb: [228,92,16]},
      {hex: '18', rgb: [172,124,0]},
      {hex: '19', rgb: [0,184,0]},
      {hex: '1A', rgb: [0,168,0]},
      {hex: '1B', rgb: [0,168,68]},
      {hex: '1C', rgb: [0,136,136]},
      {hex: '1D', rgb: [0,0,0]},
      {hex: '1E', rgb: [0,0,0]},
      {hex: '1F', rgb: [0,0,0]},
      {hex: '20', rgb: [248,248,248]},
      {hex: '21', rgb: [60,188,252]},
      {hex: '22', rgb: [104,136,252]},
      {hex: '23', rgb: [152,120,248]},
      {hex: '24', rgb: [248,120,248]},
      {hex: '25', rgb: [248,88,152]},
      {hex: '26', rgb: [248,120,88]},
      {hex: '27', rgb: [252,160,68]},
      {hex: '28', rgb: [248,184,0]},
      {hex: '29', rgb: [184,248,24]},
      {hex: '2A', rgb: [88,216,84]},
      {hex: '2B', rgb: [88,248,152]},
      {hex: '2C', rgb: [0,232,216]},
      {hex: '2D', rgb: [120,120,120]},
      {hex: '2E', rgb: [0,0,0]},
      {hex: '2F', rgb: [0,0,0]},
      {hex: '30', rgb: [252,252,252]},
      {hex: '31', rgb: [164,228,252]},
      {hex: '32', rgb: [184,184,248]},
      {hex: '33', rgb: [216,184,248]},
      {hex: '34', rgb: [248,184,248]},
      {hex: '35', rgb: [248,164,192]},
      {hex: '36', rgb: [240,208,176]},
      {hex: '37', rgb: [252,224,168]},
      {hex: '38', rgb: [248,216,120]},
      {hex: '39', rgb: [216,248,120]},
      {hex: '3A', rgb: [184,248,184]},
      {hex: '3B', rgb: [184,248,216]},
      {hex: '3C', rgb: [0,252,252]},
      {hex: '3D', rgb: [216,216,216]},
      {hex: '3E', rgb: [0,0,0]},
      {hex: '3F', rgb: [0,0,0]},
    ];

    // sort after hue
    const sorted = nespalette.map((c, i) => ({rgb: rgbToHsl(c.rgb), index: i}))
      .sort((a, b) => b.rgb[0] - a.rgb[0] || a.rgb[2] - b.rgb[2])
      .map((data) => nespalette[data.index]);


    class NESColor{
      constructor(hex, rgb){
        this.hex = hex;
        this.rgb = rgb;
        Object.freeze(this);
      }
    }

    // create color objects to be easier to deal with throughout the application
    const mappedColorList = sorted.map(color => new NESColor(color.hex, color.rgb));

    // meta config
    const meta = {
      startPage: '/graphics'
    };

    // console store
    const log = (() => {
      const store = writable([]);
      const { subscribe, update } = store;
      return {
        subscribe,
        push(e){
          if(e instanceof ErrorEvent){
            const d = new Date();
            const date = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
            e.date = date;
            update((store) => {
              // don't let the array get to big so let's reset it  
              // when it reaches a size of 20
              if(store.length > 20){
                store = [];
              }
              store.push(e);
              return store;
            });
          }
        }
      }
    })();

    // project store
    const projectStore = (() => {
      const { subscribe, set, update } = writable({
        name: undefined,
        saved: null,
      });
      return {
        subscribe,
        name: (name) => {
          if(typeof name != 'string'){
            throw new Error(`Invalid project name.`);
          }
          update(obj => ({...obj, name}));
        },
        save: (location) => {
          console.log('saving to location:', location);
        }
      }
    })();

    // disable context menu 
    window.addEventListener('contextmenu', _ => _.preventDefault());

    window.addEventListener("error", function (e) {
      // e.preventDefault();
      log.push(e);
    });

    // for debugging. remove in production
    window.addEventListener('keydown', (e) => {
      // console.log('keydown debugging. remove in production.')
      // console.log(e.code);
    });

    /*
      Enum
    */
    class Enum extends Number{
      constructor(value, key){
        if(typeof value != 'number' || typeof key != 'string'){
          throw new Error(`Invalid Enumerable arguments`);
        }
        super(value);
        this.key = key;
        this.value = value;
        Object.freeze(this);
      }
    }

    /*
      EnumerableList

      Usage:
      const types = new EnumerableList('designer', 'programmer', 'webdeveloper');
      console.log(types.get('programmer'));
    */
    class EnumerableList extends Map{
      constructor(...props){
        super();
        props.forEach((key, i) => {
          if(this.has(key)){
            throw new Error(`enum key : '${key}' already exists`);
          }
          if(typeof key !== 'string'){
            throw new Error(`Invalid key. Expecting string, got : [${typeof key}](${key})`);
          }
          const EnumerableItem = new Enum(i+1, key);
          this.set(key, EnumerableItem);
        });
        Object.freeze(this);
      }
    }

    class ActionsManager{
      constructor(...actions){
        // define
        this.__actions = this.define(...actions);
        this.__binds = new Map();
      }
      define(...args){
        const list = new EnumerableList(...args);
        this.__actions = list; 
        return list;
      }
      action(key){
        if(!this.__actions.has(key)){
          throw new Error(`Action is not defined for key '${key}'`);
        } 
        return this.__actions.get(key);
      }
      register(k, f){
        if(typeof k === 'string'){
          this.register(this.action(k), f);
          return;
        }
        if(!(k instanceof Enum)){
          throw new Error(`Invalid key value '${k}'. Expecting instance of 'Enum'`);
        }
        if(this.__binds.has(k)){
          throw new Error(`Action already defined : [${k.key}]`);
        }
        if(typeof f !== 'function'){
          throw new Error(`Invalid callback function`);
        }
        this.__binds.set(k, f);
      }
      exist(value){
        return this.__binds.has(value);
      }
      call(k, ...args){
        if(typeof k === 'string'){
          this.call(this.action(k), ...args);
          return;
        }
        if(!(k instanceof Enum)){
          throw new Error(`Invalid key '${k}'. Expecting 'Enum'`);
        }
        
        if(!this.__binds.has(k)){
          throw new Error(`Action for '${k}' does not exist`);
        }
        // handle promises to allow for chaining
        return new Promise((resolve, reject) => {
          try{
            resolve(this.__binds.get(k).call(null, ...args));
          }catch(error){
            reject(error.message);
          }
        });
      }
      execute(...args){
        return this.call(...args);
      }
    }

    // create actions
    const actions = new ActionsManager(
      'noop', // a blank command
      // application
      'application_log',

      // window
      'window_close',
      'window_minimize',
      'window_maximize',
      'window_toggle_fullscreen',
      'external_link',
      
      
      // palettes
      'palette_clear',
      'palette_create',
      'palette_remove',
      'palette_clone_layer',
      'palette_clone_active_layer',
      'palette_make_layer_active',
      'palette_swap_layers',
      'palette_update_layer_label',
      'palette_focus_rename_active_layer',
      'palette_export',
      'palette_import',
      'palette_active_color',
      
      // spritesheets
      'spritesheet_create',
      'spritesheet_remove',
      'spritesheet_clone_layer',
      'spritesheet_clone_active_layer',
      'spritesheet_update_layer_label',
      'spritesheet_make_layer_active',
      'spritesheet_swap_layers',
      'spritesheet_focus_rename_active_layer',
      'spritesheet_zoom',
      'spritesheet_zoom_in',
      'spritesheet_zoom_out',
      'spritesheet_zoom_reset',
      'spritesheet_set_active_tool',
      'spritesheet_import',
      'spritesheet_export',
      'spritesheet_import_chr',
      'spritesheet_export_chr',
      'spritesheet_export_png',

      // themes
      'toggle_theme',
      'light_theme',
      'dark_theme',
    );

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var FileSaver_min = createCommonjsModule(function (module, exports) {
    (function(a,b){b();})(commonjsGlobal,function(){function b(a,b){return "undefined"==typeof b?b={autoBom:!1}:"object"!=typeof b&&(console.warn("Deprecated: Expected third argument to be a object"),b={autoBom:!b}),b.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob(["\uFEFF",a],{type:a.type}):a}function c(a,b,c){var d=new XMLHttpRequest;d.open("GET",a),d.responseType="blob",d.onload=function(){g(d.response,b,c);},d.onerror=function(){console.error("could not download file");},d.send();}function d(a){var b=new XMLHttpRequest;b.open("HEAD",a,!1);try{b.send();}catch(a){}return 200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent("click"));}catch(c){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),a.dispatchEvent(b);}}var f="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof commonjsGlobal&&commonjsGlobal.global===commonjsGlobal?commonjsGlobal:void 0,a=f.navigator&&/Macintosh/.test(navigator.userAgent)&&/AppleWebKit/.test(navigator.userAgent)&&!/Safari/.test(navigator.userAgent),g=f.saveAs||("object"!=typeof window||window!==f?function(){}:"download"in HTMLAnchorElement.prototype&&!a?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement("a");g=g||b.name||"download",j.download=g,j.rel="noopener","string"==typeof b?(j.href=b,j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target="_blank")):(j.href=i.createObjectURL(b),setTimeout(function(){i.revokeObjectURL(j.href);},4E4),setTimeout(function(){e(j);},0));}:"msSaveOrOpenBlob"in navigator?function(f,g,h){if(g=g||f.name||"download","string"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else {var i=document.createElement("a");i.href=f,i.target="_blank",setTimeout(function(){e(i);});}}:function(b,d,e,g){if(g=g||open("","_blank"),g&&(g.document.title=g.document.body.innerText="downloading..."),"string"==typeof b)return c(b,d,e);var h="application/octet-stream"===b.type,i=/constructor/i.test(f.HTMLElement)||f.safari,j=/CriOS\/[\d]+/.test(navigator.userAgent);if((j||h&&i||a)&&"undefined"!=typeof FileReader){var k=new FileReader;k.onloadend=function(){var a=k.result;a=j?a:a.replace(/^data:[^;]*;/,"data:attachment/file;"),g?g.location.href=a:location=a,g=null;},k.readAsDataURL(b);}else {var l=f.URL||f.webkitURL,m=l.createObjectURL(b);g?g.location=m:location.href=m,g=null,setTimeout(function(){l.revokeObjectURL(m);},4E4);}});f.saveAs=g.saveAs=g,(module.exports=g);});


    });

    const filename = (filename, extension) => {
      const d = new Date();
      const date = `${String(d.getFullYear())}_${String(d.getMonth()).padStart(2, '0')}_${String(d.getDay()).padStart(2, '0')}`;
      return `${date}_${filename}.${extension}`;
    };

    const fileDialog = (accept = [], callback = _ => _, options = { readAs: 'text'}) => {
      if(!Array.isArray(accept)){
        throw new Error(`Invalid 'fileDialog' accept. Expecting array of file extentions`);
      }
      if(typeof callback !== 'function'){
        throw new Error(`Invalid 'fileDialog' callback function`);
      }
      const  input = document.createElement('input');
      input.type = 'file';
      input.accept = accept.map(ext => ext.startsWith('.') ? ext : '.' + ext).join(',');
      
      input.addEventListener('change', e => { 
        // getting a hold of the file reference
        const file = e.target.files[0]; 

        // setting up the reader
        const reader = new FileReader();

        switch(options.readAs){
          case 'binary':
            reader.readAsBinaryString(file);
          break;
          case 'arraybuffer':
            reader.readAsArrayBuffer(file);
          break;
          case 'text':
          default:
            reader.readAsText(file, options.encoding || 'utf-8');
          break;
        }

        // here we tell the reader what to do when it's done reading...
        reader.addEventListener('load', (e) => {
          // call the palette import
          callback.call(null, e.target.result);
        });
      });
      
      // execute it
      input.click();
    };

    const saveDialog = (filename, data, options = {}) => {
      const blob = new Blob([data], { type: options.type || "application/json;charset=utf-8" });
      FileSaver_min.saveAs(blob, filename);
    };

    const application = {
      startPage: '/graphics/spritesheets'
    };

    const filetypes = {
      // project 
      project: {
        save: {
          mimetype: "nesbit/project",
          extension: "nesbitproject",
          version: 2
        }
      },
      // palettes 
      palettes: {
        save: {
          mimetype: "nesbit/palette",
          extension: "nesbitpalette",
          version: 2,
        },
        export: {
          mimetype: "text/plain",
          extension: "",
          version: 1
        }
      },
      // spritesheets 
      spritesheets: {
        save: {
          mimetype: "nesbit/spritesheet",
          extension: "nesbitspritesheet",
          version: 1
        },
        export: {
          mimetype: "text/plain",
          extension: "",
          version: 1
        }
      },

      // settings
      settings: {
        save: {
          mimetype: "nesbit/settings",
          extension: "nesbitsettings",
          version: 2
        }
      }
    };

    var Config = { 
      application,
      filetypes
    };

    // get the default color
    // weird but wtf is it a reference or not? i'm just making sure we doesn't mutate the nespalette so we seralize and unserialize it here.
    const findPalette = (hex) => JSON.parse(JSON.stringify(mappedColorList.find(o => o.hex == hex)));
    const colorPlaceholder = findPalette('0F');

    // store global id count
    let id = 1;
    // colorpalette 
    class ColorPaletteGroup{
      constructor(label, colors){
        this.label = label || '';
        this.colors = [];
        this.uuid = ++id;
        if(Array.isArray(colors) && colors.length == 4){
          for(const color of colors){
            this.addColor(color.hex);
          }
        }else {
          this.colors = [...Array(4).fill('').map(item => ({ ...colorPlaceholder }))];
        }
      }
      addColor(hex){
        if(!(this.colors.length < 4)){
          throw new Error(`Max 4 colors per 'ColorPaletteGroup'`);
        }
        const palette = findPalette(hex);
        if(palette){
          this.colors.push({...palette});
        }
      }
    }

    // store
    const palettesStore = (() => {
      const reset = _ => ({
        activeLayer: undefined, 
        layers: [],
        selectedColor: 0,
      });
      const store = writable(reset());
      const { subscribe, set, update } = store;
      const storeFunctions = {
        subscribe,
        getActiveLayer(){
          return get_store_value(store).activeLayer;
        },
        setSelectedColor(n){
          if(!Number.isInteger(n)){
            throw new Error(`Invalid 'setSelectedColor' value. Expecting 'Integer'`);
          }
          if(!(n >= 0 && n <= 4)){
            throw new Error(`Invalid 'setSelectedColor' number range. Expecting number between '0-4'`);
          }
          update(store => {
            store.selectedColor = n;
            return store;
          });
        },
        create({ label, colors } = {}){
          update(store => {
            label = label || 'palette_' + (store.layers.length+1);
            const paletteGroup = new ColorPaletteGroup(label, colors);
            store.layers.push(paletteGroup);
            // make active 
            if(!store.activeLayer){
              storeFunctions.makeActive(paletteGroup);
            }

            return store;
          });
        },
        clear(){
          // clear store
          set(reset());
        },
        layerIndexFromSource(source){
          const index = get_store_value(palettesStore).layers.indexOf(source);
          return index;
        },
        getActiveColorIndex(){
          return get_store_value(palettesStore).selectedColor;
        },
        getActiveColor(i){
          const store = get_store_value(palettesStore); 
          return store.activeLayer.colors[(i >= 0 && i<= 4 ? i : store.selectedColor)];
        },
        makeActive(source){
          // check to see if the source already is active so it doesn't gets called again 
          // if that would be the case 
          if(source == get_store_value(store).activeLayer){
            return;
          }
          update(store => {
            const index = store.layers.indexOf(source);
            store.activeLayer = store.layers[index];
            return store;
          });
        },
        remove(source){
          update((store) => {
            const index = store.layers.indexOf(source);
            if(store.layers[index] == store.activeLayer){
              // if there is a palette/layer after the currently removed, make that one the active one 
              if(store.layers[index+1]){
                storeFunctions.makeActive(store.layers[index+1]);
              }else if(store.layers[index-1]){
                storeFunctions.makeActive(store.layers[index-1]);
              }else {
                store.activeLayer = undefined;
              }
            }
            // remove object
            store.layers.splice(index, 1);
            return store;
          });
        },
        swapLayers(i, j){
          update(store => {
            const arr = [...store.layers];
            [arr[i], arr[j]] = [arr[j], arr[i]]; 
            store.layers = [...arr]; 
            return store;  
          });
        },
        clone(source){
          if(!source) return;
          const _store = get_store_value(store);
          const index = _store.layers.indexOf(source);
          if(_store.layers[index] == source){
            update(store => {
              let heading = source.label + ' copy';
              const paletteGroup = new ColorPaletteGroup(heading);
              for(const color in source.colors){
                paletteGroup.colors[color] = {...findPalette(source.colors[color].hex)};
              }
              store.layers.push(paletteGroup);
              storeFunctions.makeActive(paletteGroup);
              return store;
            });
          }
        },
        updateHeading(source, string){
          update(store => {
            const index = store.layers.indexOf(source);
            store.layers[index].label = string;
            return store;
          });
        },
        swapColors(data){
          update((store) => {
            const ref = store.layers[data.layerIndex].colors;
            const ref2 = store.layers[data.to.layerIndex].colors;
            // this is all redundant but in place if things change in the future        
            let from = ref[data.colorIndex];
            let to = ref2[data.to.colorIndex];
            
            // swap the colors
            ref[data.colorIndex] = { ...findPalette(to.hex) };
            ref2[data.to.colorIndex] = { ...findPalette(from.hex) };

            // make active 
            if(data.layerIndex != data.to.layerIndex){
              storeFunctions.makeActive(store.layers[data.to.layerIndex]);
            }

            return store;
          });
        },
        replaceColor(data){
          update((store) => {
            const layer = store.layers[data.layerIndex];

            // not really required but might be easier to manage in the future
            const palette = findPalette(data.hex);

            layer.colors[data.colorIndex] = {
              hex: palette.hex,
              rgb: palette.rgb
            };

            storeFunctions.makeActive(store.layers[data.layerIndex]);

            return store;
          });
        },
        export(serialize){
          let data = {version: Config.filetypes.palettes.save.version, data: [...get_store_value(palettesStore).layers]};
          if(serialize){
            data = JSON.stringify(data);
          }
          return data;
        },
        import(serializedData){
          const unserializedData = JSON.parse(serializedData);
          if(unserializedData.version == Config.filetypes.palettes.save.version){
            for(const palette of unserializedData.data){
              storeFunctions.create({...palette});
            }
          }
        }
      };

      return storeFunctions;
    })();


    // NOTE: temp import during development 
    const json = `{"version":2,"data":[{"label":"fire","colors":[{"hex":"0F","rgb":[0,0,0]},{"hex":"27","rgb":[252,160,68]},{"hex":"06","rgb":[168,16,0]},{"hex":"07","rgb":[136,20,0]}]},{"label":"purple","colors":[{"hex":"0F","rgb":[0,0,0]},{"hex":"16","rgb":[248,56,0]},{"hex":"13","rgb":[104,68,252]},{"hex":"03","rgb":[68,40,188]}]},{"label":"teal","colors":[{"hex":"0F","rgb":[0,0,0]},{"hex":"31","rgb":[164,228,252]},{"hex":"1C","rgb":[0,136,136]},{"hex":"0C","rgb":[0,64,88]}]},{"label":"blue steele","colors":[{"hex":"0F","rgb":[0,0,0]},{"hex":"12","rgb":[0,88,248]},{"hex":"01","rgb":[0,0,252]},{"hex":"02","rgb":[0,0,188]}]}]}`;
    palettesStore.import(json);

    const writable$1 = (value, fn) => {
      const store = writable(value);
      let ret = { ...store, get: _ => get_store_value(store) };
      if(fn){
        ret = { ...ret, ...(fn.call(null, { value, store, get: ret.get } || { ...ret })) };
      }
      return Object.freeze(ret);
    };

    // shuffel an array

    // split array into chunks
    const chunk = (array, size) => {
      const length = array ? array.length : 0;
      if(length < 1){
        return [];
      }
      const result = new Array(Math.ceil(length / size));
      let index = 0, resIndex = 0;
      while(index < length){
        result[resIndex++] = array.slice(index, (index += size));
      }
      return result;
    };

    // convert the number to a binary string
    const getBinaryStringFromNumber = (n) => {
      // convert to binary
      n = Number(n >>> 0).toString(2);
      // force it's length to be 8 by padding 0's
      return '00000000'.substring(n.length)+n;
    };

    /*
      Get color definition from high low

      the chr can have 4 values. 0-3. 
      'a' has a weight of 1 and 'b' has a weight of 2. 
      a, b, result
      0, 0, 0, // both a and b are 0 so the result is 0
      1, 0, 1, // a is set to 1 so it becomes one
      0, 1, 2, // a is set to 0 and b is 1 so it becomes 2. (because b has a weight of 2)
      1, 1, 3, // a and b is set to 1 so the result becomes 3. a(1) + b(2) = 3

      @param String (binary string)
      @param String (binary string)

      @return Array
    */
    function getColorDefinitionFromHighLow(low, high){
      // this will be 0 or 1 if it does not get 
      // replaced in the following if statements
      let n = Number(low);
      // if high != 0. it's 2. since thats either 0 or 1. 
      // and if its not 0(which would be false) its 1. meaning it's 2
      if(Number(high)){
        n = 2;
      }
      // if low + high > 1(if both a and b is set. it's larger than 1. then we know it has to be 3. 1 + 2 = 3)
      if((Number(low) + Number(high)) > 1){
        n = 3;
      }
      return n;
    }

    /* 
      parse contents of a NES chr file 

      @param ArrayBuffer
      @return Array

      This function will return a 16x16 2d array of 8x8 2d array representing each tile 
    */
    const parse = (data) => {
      // split the byte array in chunks of 16. 1 row = 16 tiles.
      // a tile is 8x8. which means you have 64 pixels in each tile. 
      // each pixel has 4 available color values which ends up to (8x8) x 4(color value from 0-3) = 256.
      const chunks = chunk(new Uint8Array(data), 16);
      let tiles = [];
      for(let chunk of chunks){
        let low, high, tile = [];
        // handle all 16 bits. 
        // the first 8 bits is the low 
        // and the second 8 bits is the high
        for(let i = 8; i < 16; i++){
          low = getBinaryStringFromNumber(chunk[i-8]);
          high = getBinaryStringFromNumber(chunk[i]);
          // create the pixel definition from the low and high bits
          // this would be a row of 8 pixels. the loop will do 
          // this 8 times to form a 8x8 tile
          const pixelRow = [];
          for(let i = 0; i < 8; i++){
            const pixel = getColorDefinitionFromHighLow(low[i], high[i]);
            pixelRow.push(pixel);  
          }
          tile.push(pixelRow);
        }
        tiles.push(tile);
      }
      // split the tiles array by 16. 
      // 16 8x8 tiles per each row
      tiles = chunk(tiles, 16);
      // split the CHR data in parts of size(16 for the nes) for giving 16x16 per page
      return chunk(tiles, 16);
    };

    /*
      generate chr export
      from the pixel definition we can get the corresponding low and high bits. this could be done manually or 
      by doing a bitwise AND and right shift the high bits by 1 to get the opposite values implemented below.

      n: 0
      0x00 & 0x01 = 0
      00000000
      00000001

      n: 1
      0x55 & 0x01 = 1
      ‭01010101‬
      00000001

      n: 2
      0xAA & 0x01 = 0
      ‭10101010
      00000001
      ‬
      n: 3
      0xFF & 0x01 = 1
      ‭11111111
      00000001

    */
    const generateExport = (data) => {
      // mappings of 4 parts of hex value up to 255. 
      // this to be able to implement colors later 
      const map = [0x00, 0x55, 0xAA, 0xFF];
      // 4kb buffer
      const buff = new ArrayBuffer(4096);
      const output = new Uint8Array(buff);
      // store the binary string
      let bin = '';
      // loop through the nested 2d arrays
      for(let h of data){
        for(let w of h){
          // store low and high bits
          let low = '', high = '';
          for(let x of w){
            for(let n of x){
              // map current value for numbers 0-4
              const v = map[n];
              low += v & 0x01;
              high += (v >> 1) & 0x01;
            }
          }
          // add the low and high values to binary
          bin += low + high;
        }
      }
      // split binary string in 8's and append each 8 bits to the buffer
      bin.match(/.{8}/g).map((_, i) => output[i] = parseInt(_, 2));
      return output;
    };

    // get the default color
    // weird but wtf is it a reference or not? i'm just making sure we doesn't mutate the nespalette so we seralize and unserialize it here.
    const findNESPalette = (hex) => JSON.parse(JSON.stringify(mappedColorList.find(o => o.hex == hex)));
    const colorPlaceholder$1 = findNESPalette('0F');

    // store global id count
    let id$1 = 1;
    // colorpalette 
    class ColorPaletteGroup$1{
      constructor(label, colors){
        this.label = label || '';
        this.colors = [];
        this.uuid = ++id$1;
        if(Array.isArray(colors) && colors.length == 4){
          for(const color of colors){
            this.addColor(color.hex);
          }
        }else {
          this.colors = [...Array(4).fill('').map(item => ({ ...colorPlaceholder$1 }))];
        }
      }
      addColor(hex){
        if(!(this.colors.length < 4)){
          throw new Error(`Max 4 colors per 'ColorPaletteGroup'`);
        }
        const palette = findNESPalette(hex);
        if(palette){
          this.colors.push({...palette});
        }
      }
    }

    // selected color store
    const selectedColor = writable$1(0, ({ store, get }) => {
      return {
        // set the active color index
        setActiveColorIndex(n){
          if(!Number.isInteger(n)){
            throw new Error(`Invalid 'setActiveColorIndex' value. Expecting 'Integer'`);
          }
          if(!(n >= 0 && n <= 4)){
            throw new Error(`Invalid 'setActiveColorIndex' number range. Expecting number between '0-4'`);
          }
          store.set(n);
        },
        // get active color value
        getActiveColorValue(n){
          const activeLayer = Palettes.stores.activeLayer.get();
          if(!activeLayer){
            throw new Error(`No 'activeLayer' selected`);
          }
          if(!Number.isInteger(n)){
            n = get();
          }
          return activeLayer.colors[n];
        }
      }
    });

    // layers store
    const layers = writable$1([], ({ store, value, get, update }) => {
      return {
        // clear all layers
        clear(){
          Palettes.stores.activeLayer.set(undefined);
          store.set([]);
        },
        // swap layers
        swapLayers(i, j){
          store.update(_store => {
            const arr = [..._store];
            [arr[i], arr[j]] = [arr[j], arr[i]]; 
            _store = [...arr]; 
            Palettes.stores.activeLayer.set(_store[j]);
            return _store;  
          });
        },
        // replace color
        replaceColor(data){
          store.update((_store) => {
            const layer = _store[data.layerIndex];
            // not really required but might be easier to manage in the future
            const colorFromPalette = findNESPalette(data.hex);

            // add the new color values
            layer.colors[data.colorIndex] = {
              hex: colorFromPalette.hex,
              rgb: colorFromPalette.rgb
            };

            // make the layer active. This updates the activeLayer so we don't have to 
            // force a manual update to make main artboard palette react to the changes
            // and also it's nice to automatically change the active palette
            Palettes.makeLayerActive(_store[data.layerIndex]);
            return _store;
          });
        },

        // swap colors
        swapColors(data){
          store.update((_store) => {
            Palettes.update();
            const ref = _store[data.layerIndex].colors;
            const ref2 = _store[data.to.layerIndex].colors;
            // this is all redundant but in place if things change in the future        
            let from = ref[data.colorIndex];
            let to = ref2[data.to.colorIndex];
            
            // swap the colors
            ref[data.colorIndex] = { ...findNESPalette(to.hex) };
            ref2[data.to.colorIndex] = { ...findNESPalette(from.hex) };

            // make active just to force a reactive update and also if swapped 
            // between layers we use the new layer
            Palettes.makeLayerActive(_store[data.to.layerIndex]);

            return _store;
          });
        },
      }
    });

    const Palettes = writable$1({ selectedColor, activeLayer: writable$1(), layers }, ({ store, value, get }) => {
      return {
        lastChanged: writable$1(), 
        stores: value,
        // update
        update(){
          Palettes.lastChanged.set(Math.random() + Date.now()); 
        },
        // create new color palette
        createLayer({ label, colors } = {}, push = false){
          value.layers.update(_store => {
            label = label || 'palette_' + (_store.length+1);
            const paletteGroup = new ColorPaletteGroup$1(label, colors);
            // if we need to add the new layer to the end of the layer stack
            // for instance on imports, else imports would become reversed
            if(push){
              _store = [..._store, paletteGroup];
            }else {
              _store = [paletteGroup, ..._store];
            }
            // make active 
            Palettes.makeLayerActive(paletteGroup);
            return _store;
          });
        },

        // remove layer
        removeLayer(ColorPaletteGroupInstance){
          value.layers.update((_store) => {
            const index = _store.indexOf(ColorPaletteGroupInstance);
            if(ColorPaletteGroupInstance == value.activeLayer.get()){
              // if there is a palette/layer after the currently removed, make that one the active one 
              if(_store[index+1]){
                Palettes.makeLayerActive(_store[index+1]);
              }else if(_store[index-1]){
                Palettes.makeLayerActive(_store[index-1]);
              }else {
                value.activeLayer.set(undefined);
              }
            }
            // remove object
            _store.splice(index, 1);
            return _store;
          });
        },

        // clone layer 
        cloneLayer(ColorPaletteGroupInstance){
          // TODO: make so the index position is right above the clones layer. currently
          // it gets added to the top of the stack as the first array element, which is not ideal.
          value.layers.update((_store) => {
            let { label, colors } = ColorPaletteGroupInstance;
            // NOTE: probably have to serialize the data so it doesn't act as a reference 
            // data = JSON.stringify(JSON.parse(data));
            label = label + ' copy';
            const newLayer = new ColorPaletteGroup$1(label, colors);
            _store = [ newLayer, ..._store];
            Palettes.makeLayerActive(newLayer);
            return _store;  
          });
        },
        
        // clone active layer 
        cloneActiveLayer(){
          const active = value.activeLayer.get();
          if(active){
            Palettes.cloneLayer(active);
          }else {
            Palettes.createLayer();
          }
        },

        // make a layer active
        makeLayerActive(ColorPaletteGroupInstance){
          if(!(ColorPaletteGroupInstance instanceof ColorPaletteGroup$1)){
            throw new Error(`Invalid 'ColorPaletteGroupInstance' while setting 'activeLayer'`);
          }
          value.activeLayer.set(ColorPaletteGroupInstance);
        },

        // layer index from source
        layerIndexFromSource(ColorPaletteGroupInstance){
          if(!(ColorPaletteGroupInstance instanceof ColorPaletteGroup$1)){
            throw new Error(`Invalid 'ColorPaletteGroupInstance' in 'layerIndexFromSource'`);
          }
          return value.layers.get().indexOf(ColorPaletteGroupInstance);
        },
        
        // update label
        updateLayerLabel(ColorPaletteGroupInstance, label){
          value.layers.update((_store) => {
            ColorPaletteGroupInstance.label = label;
            Palettes.makeLayerActive(ColorPaletteGroupInstance);
            return _store;
          });
        },

        // import 
        import(serializedData){
          const shouldMakeActive = Palettes.stores.layers.get().length <= 0;
          const unserializedData = JSON.parse(serializedData);
          if(unserializedData.version == Config.filetypes.palettes.save.version){
            for(const palette of unserializedData.data){
              Palettes.createLayer({ ...palette }, true);
            }
          }
          if(shouldMakeActive && Palettes.stores.layers.length){
            Palettes.makeLayerActive(Palettes.stores.layers.get()[0]);
          }
        },

        // export
        export(serialize){
          const layers = Palettes.stores.layers.get();
          let data = { version: Config.filetypes.palettes.save.version, data: [...layers] };
          if(serialize){
            data = JSON.stringify(data);
          }
          return data;
        },

      }
    });

    // NOTE: temp import during development 
    const json$1 = `{"version":2,"data":[{"label":"fire","colors":[{"hex":"0F","rgb":[0,0,0]},{"hex":"27","rgb":[252,160,68]},{"hex":"06","rgb":[168,16,0]},{"hex":"07","rgb":[136,20,0]}]},{"label":"purple","colors":[{"hex":"0F","rgb":[0,0,0]},{"hex":"16","rgb":[248,56,0]},{"hex":"13","rgb":[104,68,252]},{"hex":"03","rgb":[68,40,188]}]},{"label":"teal","colors":[{"hex":"0F","rgb":[0,0,0]},{"hex":"31","rgb":[164,228,252]},{"hex":"1C","rgb":[0,136,136]},{"hex":"0C","rgb":[0,64,88]}]},{"label":"blue steele","colors":[{"hex":"0F","rgb":[0,0,0]},{"hex":"12","rgb":[0,88,248]},{"hex":"01","rgb":[0,0,252]},{"hex":"02","rgb":[0,0,188]}]}]}`;
    Palettes.import(json$1);

    class CanvasLayer{
      constructor({ label, width, height, data } = {}){
        this._isInitialized = false;
        this.uuid = Math.random() + Date.now();
        this.width = width || 128;
        this.height = height || 128;
        this.label = label || '';
        this.element = document.createElement('canvas');
        this.element.width = this.width;
        this.element.height = this.height;
        this.context = this.element.getContext('2d');
        this.data = data;
        // generate a double nested array list. 16x16 column then inside each tile they are 8x8 pixels wide
        if(!this.data){
          this.data = new Array(16).fill().map(_ => new Array(16).fill().map(_ => new Array(8).fill().map(_ => new Array(8).fill().map(_ => 0))));
        }else {
          if(!this._isInitialized){
            // draw it on first instantiation else imports wont reveal themselves unless becoming active layers
            this.drawFromSource(Palettes.stores.activeLayer.get());
          }
        }
      }
      async toDataURL(mimetype = 'image/png', quality){
        const blob = await fetch(this.element.toDataURL(mimetype, quality)).then(res => res.blob());
        return blob;
      }
      // get palette info from x y 
      colorIndexAtPosition(x, y){
        const data = this.data;
        const rc = {x: Math.floor(x / 8), y: Math.floor(y / 8)};
        const tile = {x: x % 8, y: y % 8};
        const colorIndex = data[rc.y][rc.x][tile.y][tile.x];
        return colorIndex;
      }
      setColorIndexAtPosition(x, y, colorIndex){
        const data = this.data;
        const rc = {x: Math.floor(x / 8), y: Math.floor(y / 8)};
        const tile = {x: x % 8, y: y % 8};
        data[rc.y][rc.x][tile.y][tile.x] = colorIndex;
      }
      drawFromSource(palette){
        if(!palette) return;
        if(!this._isInitialized){
          this._isInitialized = true;
        }

        // TODO: whenever a drawFromSource happends store a history 
        // of it so it's possible to revert changes and mistakes
        // this.history.push(this.data); 

        // one line list of tiles... split on % 16 for new row
        this.data.map((trow, tr) => {
          trow.map((tcol, tc) => {
            this.context.save();
            this.context.translate(tc*8, tr*8);

              tcol.map((col, c) => {
                this.context.save();
                this.context.translate(0, c);

                  col.map((row, r) => {
                    this.context.save();
                    this.context.translate(r, 0);

                    let color = palette.colors[row];
                    if(!color){
                      return;
                    }
                    this.context.fillStyle = `rgb(${color.rgb})`;
                    this.context.fillRect(0,0,1,1);
                    this.context.restore();

                  });
                  
                this.context.restore();
              });

            this.context.restore();      
          });
        });
        
      }
      clear(){
        this.context.clearRect(0, 0, this.element.width, this.element.height);
      }
    }

    const layers$1 = writable$1([], ({ store, value, get }) => {
      return {
        // swap layers
        swapLayers(i, j){
          store.update(_store => {
            const arr = [..._store];
            [arr[i], arr[j]] = [arr[j], arr[i]]; 
            _store = [...arr]; 
            Spritesheets.stores.activeLayer.set(_store[i]);
            return _store;  
          });
        },
      }
    });

    const activeLayer = writable$1(undefined);

    const Spritesheets = writable$1({ activeLayer, layers: layers$1 }, ({ store, value, get }) => {

      return {
        data: {
          width: 128,
          height: 128,
        },
        stores: value,
        // create a new spritesheet layer
        createLayer({ label, data } = {}){
          Spritesheets.stores.layers.update(_store => {
            label = label || 'spritesheet_' + (_store.length+1);
            const CanvasLayerInstance = new CanvasLayer({ label, data });
            const _store_copy = [CanvasLayerInstance, ..._store];
            // _store = [..._store, CanvasLayerInstance];
            // do we always want to make the new layer active?
            // if(_store.length <= 1){
            //   Spritesheets.makeLayerActive(CanvasLayerInstance);
            // }
            // make new layer active
            Spritesheets.makeLayerActive(CanvasLayerInstance);
            return _store_copy;
          });
        },

        // remove layer
        // NOTE: memory leak if all layers is removed. adding layer after all is remove
        // leas to more and more memory leaks for each time the whole array gets empty. 
        removeLayer(CanvasLayerInstance){
          Spritesheets.stores.layers.update((_store) => {
            let _store_copy = [..._store];
            const index = _store_copy.indexOf(CanvasLayerInstance);
            if(CanvasLayerInstance == Spritesheets.stores.activeLayer.get()){
              // if there is a palette/layer after the currently removed, make that one the active one 
              if(_store_copy[index+1]){
                Spritesheets.makeLayerActive(_store_copy[index+1]);
              }else if(_store_copy[index-1]){
                Spritesheets.makeLayerActive(_store_copy[index-1]);
              }else {
                Spritesheets.stores.activeLayer.set(undefined);
              }
            }
            // remove object
            _store_copy = _store_copy.filter(instance => instance != CanvasLayerInstance);
            return _store_copy;
          });
        },

        // clone layer 
        cloneLayer(CanvasLayerInstance){
          // TODO: make so the index position is right above the clones layer. currently
          // it gets added to the top of the stack as the first array element, which is not ideal.
          Spritesheets.stores.layers.update((_store) => {
            let { width, height, label, data } = CanvasLayerInstance;
            // we need to serialize the data else it will reference the same data
            if(Array.isArray(data)){
              data = JSON.parse(JSON.stringify(data));
            }
            label = label + ' copy';
            const newLayer = new CanvasLayer({ width, height, label, data });
            _store = [ newLayer, ..._store];
            Spritesheets.makeLayerActive(newLayer);
            return _store;  
          });
        },
        
        // clone active layer 
        cloneActiveLayer(){
          const active = Spritesheets.stores.activeLayer.get();
          if(active){
            Spritesheets.cloneLayer(active);
          }else {
            Spritesheets.createLayer();
          }
        },
        // make a layer active
        makeLayerActive(CanvasLayerInstance){
          if(!(CanvasLayerInstance instanceof CanvasLayer)){
            throw new Error(`Invalid 'CanvasLayerInstance' while setting 'activeLayer'`);
          }
          Spritesheets.stores.activeLayer.set(CanvasLayerInstance);
        },

        // update label
        updateLayerLabel(CanvasLayerInstance, label){
          Spritesheets.stores.layers.update((_store) => {
            CanvasLayerInstance.label = label;
            return _store;
          });
        },

        // import 
        import(serializedData){
          const unserializedData = JSON.parse(serializedData);
          if(unserializedData.version == Config.filetypes.spritesheets.save.version){
            for(const spritesheet of unserializedData.data){
              Spritesheets.createLayer({ ...spritesheet });
            }
          }
        },

        // export 
        export(serialize){
          let data = { version: Config.filetypes.spritesheets.save.version, data: [ ...Spritesheets.stores.layers.get() ] };
          if(serialize){
            data = JSON.stringify(data);
          }
          return data;
        },

        // import chr
        importCHR(filedata){
          const result = parse(filedata);
          result.forEach(page => Spritesheets.createLayer({ data: page }));
        },

        // export chr
        exportCHR(){
          const activeLayer = Spritesheets.stores.activeLayer.get();
          if(!activeLayer || !activeLayer.data){
            throw new Error(`Unable to export CHR. No 'activeLayer'`);  
          }
          const bytearray = generateExport(activeLayer.data);
          return { label: activeLayer.label, data: bytearray };
        },
        
        // export image
        exportAsImage(callback, mimetype = 'image/png', quality = 1){
          const activeLayer = Spritesheets.stores.activeLayer.get();
          if(!(activeLayer instanceof CanvasLayer)){
            throw new Error(`Unable to export Image. No 'activeLayer'`);
          }
          const fn = (blob) => {
            callback.call(null, { blob, label: activeLayer.label, options: { mimetype, quality } });
          };
          return { label: activeLayer.label, image: activeLayer.element.toBlob(fn, mimetype, quality), options: { type: mimetype } };
        }
      }
    });

    // temp
    Spritesheets.createLayer();

    // tools 
    const ToolTypes = new EnumerableList(
      'pointer', 
      'pen', 
      'paintbucket', 
      'eyedropper', 
      'colorswap', 
      'transform', 
      'marquee', 
      'zoom', 
      'preview', 
      'tileswap', 
      'preview_region',
      'tilecolor'
    );

    class Cursor{
      constructor(props){
        this.icon = '';
        this.offset = {x: 0, y: 0};
        this.size = {width: 11, height: 11};
        this.scale = {x: 1, y: 1};
        Object.assign(this, props);
      }
    }

    class Tool{
      constructor(props){
        this.visible_in_toolbar = true;
        this.pixelIndicator = false;
        this.singleAction = false;
      }
      get optionsPanelComponent(){
        return undefined;
      }
      onMount(){}
      onDestroy(){}
      primary(){}
      secondary(){}
      move(){}
      mouseup(){}
      reset(){}
    }

    class Pointer extends Tool{
      constructor(){
        super();
        this.name = 'pointer';
        this.enum = ToolTypes.get('pointer');
        this.weight = 100;
        this.icon = 'M4 0l16 12.279-6.78 1.138 4.256 8.676-3.902 1.907-4.281-8.758-5.293 4.581z';
        this.cursor = new Cursor({});
      }
      primary({x, y, context}){}
      secondary({x, y, context}){}
      move({x, y, context}){}
    }

    /*
      requestanimationframe loop
      
      @param callback (Function)
      @param fps (Number) (optional)
      
      @return cancel (Function)

      Usage:
      const stop = AnimationLoop((delta, framecount, stop, time) => {
        console.log(delta, framecount);
        if(framecount > 99){
          stop();
        }
      }, 30);
    */
    const AnimationLoop = (fn, fps = null) => {
      if(typeof fn !== 'function'){
        throw new Error(`Invalid callback function.`);
      }
      let paused = false;
      let framecount = 0;
      let animation;
      let lastTime = performance.now();
      const cancel = _ => cancelAnimationFrame(animation);
      const pause = _ => paused = true;
      const play = _ => paused = false;
      const toggle = _ => paused = !paused;
      const loop = (time) => {
        animation = requestAnimationFrame(loop);
        if(paused){
          return;
        }
        const delta = time - lastTime;
        const now = performance.now();
        if(!fps || now - lastTime > 1000 / fps){
          fn.call(null,{ delta: delta / 1000, frame: ++framecount, cancel, time, pause, play });
          lastTime = time;
        }
      };
      animation = requestAnimationFrame(loop);
      return {
        unsubscribe: cancel,
        pause,
        play,
        toggle,
      };
    };

    class Layer{
      constructor(){
        this.canvas = document.createElement('canvas');
        this.canvas.width = 128;
        this.canvas.height = 128;
        this.context = this.canvas.getContext('2d');
      }
      render(){
        console.log('Render not implemented');
      }
    }

    class Grid extends Layer{
      constructor(...args){
        super(...args);
        this.width = 128;
        this.height = 128; 
        this.size = 8; 
        this.o1 = .05; 
        this.o2 = .005;
      }
      render(){
        this.context.clearRect(0,0,this.width, this.height);
        this.context.globalAlpha = 1;
        for(let ix = 0; ix <= (this.width/this.size); ix++){
          for(let iy = 0; iy <= (this.height/this.size); iy++){
              this.context.save();
              this.context.translate(ix*this.size, iy*this.size);
              if((ix+iy) % 2 == 0){
                this.context.globalAlpha = this.o1;
                this.context.fillStyle = 'white';
              }else {
                this.context.globalAlpha = this.o2;          
                this.context.fillStyle = 'black';
              }
              this.context.fillRect(0, 0, this.size, this.size);
              this.context.restore();
            
            // TODO: fix the gradient that occurs on each 8x8 tile.
            // also at the top, the first 8 rows is gradient shifted.
            // if(ix % this.size == 0){
            //   this.context.save();
            //   this.context.translate(ix, iy);
            //     if(((ix + iy) / this.size) % 2 == 0){
            //       this.context.fillStyle = 'white';
            //       this.context.globalAlpha = this.o1;              
            //     }else{
            //       this.context.fillStyle = 'black';
            //       // this.context.globalAlpha = this.o2;
            //     }
            //     this.context.fillRect(0,0,8,8);
            //   this.context.restore();
            // }
          }
        }
      }
    }

    class Cursor$1 extends Layer{
      constructor(...args){
        super(...args);
        this.width = 128;
        this.height = 128; 
        this.size = 1;
        this.x;
        this.y;
      }
      render(){
        if(!this.x || !this.y) return;
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.globalAlpha = .4;
        this.context.fillStyle = 'white';
        this.context.fillRect(this.x, this.y, this.size, this.size);
      }
    }

    const Type = Object.freeze({ primary: 1, secondary: 2, move: 3, mouseup: 4 });

    const grid = new Grid();
    const cursor = new Cursor$1();

    const overlays = [
      grid,
      cursor
    ];

    class SpritesheetEditor{
      defineCanvas(canvas){
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.canvas.addEventListener('mousedown', this.eventHandler.mousedown);
      }

      constructor({ canvas, context, width, height }){
        this.activeLayer = undefined;
        this.activePaletteLayer = undefined;
        this.lastChanged = undefined;

        this.canvas;
        this.context;

        this.width = width;
        this.height = height;

        const fps = 0;
        this.animationLoop = AnimationLoop(this.render.bind(this), fps);
        
        this.events = {};
        this.eventHandler = {};

        const callActionType = (type, e) => {
          e.mouseIsDown = mouseIsDown;
          switch(type){
            case Type.primary:
              callEvent('primary', e);
            break;
            case Type.secondary:
              callEvent('secondary', e);
            break;
            case Type.move:
              callEvent('move', e); 
            break;
            case Type.mouseup:
              callEvent('mouseup', e); 
            break;
            default:
              console.log('hmm...');
          }
        };

        // temp to see if mouse pos handles the transform css scale
        function  getMousePos(canvas, evt) {
          if(!canvas) return {x: 0, y: 0};
          const rect = canvas.getBoundingClientRect(), // abs. size of element
            scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
            scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
        
          return {
            x: Math.floor((evt.clientX - rect.left) * scaleX),   // scale mouse coordinates after they have
            y: Math.floor((evt.clientY - rect.top) * scaleY)     // been adjusted to be relative to element
          }
        }

        const callEvent = (type, e) => {
          if(this.events[type]){
            e.realMousePosition = getMousePos(this.canvas, e); 
            this.events[type].call(null, e);
          }
        };
        // handle event actions
        let mouseIsDown = false;
        this.eventHandler.mousemove = (e) => {
          callActionType(Type.move, e);
        };
        this.eventHandler.mouseup = e => {
          mouseIsDown = false;
          callActionType(Type.mouseup, e);
        };
        this.eventHandler.mousedown = (e) => {
          mouseIsDown = true;
          let type;
          if(e.which == 1){
            type = Type.primary;
          }else if(e.which == 3){
            type = Type.secondary;
          }else {
            return;
          }
          callActionType(type, e);
        };

        // bind events
        document.addEventListener('mousemove', this.eventHandler.mousemove);
        document.addEventListener('mouseup', this.eventHandler.mouseup);
      }
      on(event, fn){
        if(typeof event != 'string' && typeof fn !== 'function'){
          throw new Error(`Invalid eventlistener`);
        }
        if(this.events[event]){
          throw new Error(`Event already exists : ${event}`);
        }
        this.events[event] = fn;
      }

      // render
      render({ cancel, delta, frame, time }){
        if(!this.canvas) return;

        this.context.clearRect(0,0, 128, 128);
        const activeLayer = Spritesheets.stores.activeLayer.get();
        const activePaletteLayer = Palettes.stores.activeLayer.get();
        if(activeLayer && activePaletteLayer){
          if(this.lastChanged != Palettes.lastChanged.get() || (this.activeLayer != activeLayer || this.activePaletteLayer != activePaletteLayer)){
            // set the current active layers
            this.activeLayer = activeLayer;
            this.activePaletteLayer = activePaletteLayer;
            // draw from source
            activeLayer.drawFromSource(activePaletteLayer);
            // store last change to palettes so we can force an update
            this.lastChanged = Palettes.lastChanged.get();
          }
          // draw active layer on the canvas context
          this.context.drawImage(activeLayer.element, 0,0);
          // draw overlay layers
          overlays.forEach((layer) => {
            layer.render();
            this.context.drawImage(layer.canvas, 0, 0);
          });

        }
      }
      // clean up
      destroy(){
        // stop animationframe
        this.animationLoop.unsubscribe();
        // clean up events
        if(this.canvas){
          this.canvas.removeEventListener('mousedown', this.eventHandler.mousedown);
        }
        document.removeEventListener('mousemove', this.eventHandler.mousemove);
        document.removeEventListener('mouseup', this.eventHandler.mouseup);
      }
    }

    // sub options
    // import PenOptions from '~/ui/sections/graphics/spritesheets/tooloptions/Pen.svelte';

    class Pen extends Tool{
      constructor(){
        super();
        this.pixelIndicator = true;
        this.name = 'pen';
        this.enum = ToolTypes.get('pen');
        this.weight = 90;
        this.icon = 'M19.769 9.923l-12.642 12.639-7.127 1.438 1.438-7.128 12.641-12.64 5.69 5.691zm1.414-1.414l2.817-2.82-5.691-5.689-2.816 2.817 5.69 5.692z';
        this.cursor = new Cursor({
          icon: 'M19.769 9.923l-12.642 12.639-7.127 1.438 1.438-7.128 12.641-12.64 5.69 5.691zm1.414-1.414l2.817-2.82-5.691-5.689-2.816 2.817 5.69 5.692z',
          size: {
            width: 46,
            height: 46,
          },
          offset: {
            x: 0, 
            y: 11
          }
        });

        this.properties = {
          size: 1,
          drawStack: [],
          lastDraw: undefined,
          start: undefined,
        };
        // store modified pixels
        this.modifiedPixels = [];
      }
      
      // return suboptions
      get optionsPanelComponent(){
        return PenOptions;
      }

      paint(e){
        const colorData = Palettes.stores.selectedColor.getActiveColorValue(e.colorIndex);
        const { rgb, hex } = colorData; 
        if(!colorData){
          return;
        }
        const context = Spritesheets.stores.activeLayer.get()?.context;
        if(!context){
          console.log('Error loading context');
          return;
        }
        // loop over the stack
        this.properties.drawStack.map(item => {
          const { x, y } = item.realMousePosition;
          context.save();
            context.translate(x, y);
            context.fillStyle = `rgb(${rgb.join(',')})`;
            context.fillRect(0, 0, this.properties.size, this.properties.size);
            // store the modified pixels
            // NOTE: this will not work with anything other than 1 px size pen
            this.modifiedPixels.push({ x, y, colorIndex: Number.isInteger(e.colorIndex) ? e.colorIndex : Palettes.stores.selectedColor.get() });
          context.restore();
        });
        this.properties.lastDraw = this.properties.drawStack.pop();
        this.properties.drawStack = [];
      }

      primary(props){
        if(props.shiftKey){
          this.drawLineFromPoint(props, { ...props.realMousePosition });
        }else {
          this.properties.drawStack.push(props);
        }
        this.paint.call(this, props);
      }

      secondary(props){
        props = { ...props, colorIndex: 0};
        // if(props.shiftKey){
        //   this.drawLineFromPoint(props, { ...props.realMousePosition });
        // }else{
        //   this.properties.drawStack.push(props);
        // }
        this.properties.drawStack.push(props);
        this.paint.call(this, props);
      }

      drawLineFromPoint(props, end){
        if(!this.properties.start){
          return;
        }

        let { x, y } = this.properties.start;
        if(Math.abs(end.x - x) > Math.abs(end.y - y)){
          while(x != end.x){
            if(x < end.x) x++;
            if(x > end.x) x--;
            this.properties.drawStack.push({ ...props, realMousePosition: { x, y } });
          }
        }else {
          while(y != end.y){
            if(y < end.y) y++;
            if(y > end.y) y--;
            this.properties.drawStack.push({ ...props, realMousePosition: { x, y } });
          }
        }

      }
      move(props){
        // update cursor position
        cursor.x = props.realMousePosition.x;
        cursor.y = props.realMousePosition.y;

        if(props.shiftKey || !props.mouseIsDown) return;

        const fillStack = (props) => {
          if(this.properties.lastDraw){
            let { x, y } = { ...this.properties.lastDraw.realMousePosition };
            while(x != props.realMousePosition.x || y != props.realMousePosition.y){
              if(x < props.realMousePosition.x) x++;
              if(x > props.realMousePosition.x) x--;
              if(y < props.realMousePosition.y) y++;
              if(y > props.realMousePosition.y) y--;
              this.properties.drawStack.push({...props, realMousePosition: { x, y } });
            }
          }else {
            this.properties.drawStack.push(props);
          }
        };
        
        if(props.which == 1){
          // call the primary action
          fillStack(props);
          this.primary.call(this, props);
        }else if(props.which == 3){
          fillStack(props);
          this.secondary.call(this, props);
        }
        
      }
      mouseup(){
        const dataRef = Spritesheets.stores.activeLayer.get()?.data;
        if(!dataRef){
          return;
        }
        for(const pixel of this.modifiedPixels){
          let {x, y, colorIndex } = pixel;
          const rc = {x: Math.floor(x / 8), y: Math.floor(y / 8)};
          const tile = {x: x % 8, y: y % 8};
          // wtf is this??? well whatever.. 
          if(dataRef[rc.y] && dataRef[rc.y][rc.x] && dataRef[rc.y][rc.x][tile.y] && Number.isInteger(dataRef[rc.y][rc.x][tile.y][tile.x])){
            dataRef[rc.y][rc.x][tile.y][tile.x] = colorIndex;
          }
        }
        // same last pixel which will be the start for the next draw. if drawing line for instance
        const lastPixel = this.modifiedPixels[this.modifiedPixels.length-1];
        if(lastPixel){
          this.properties.start = { ...lastPixel };
        }
        this.modifiedPixels = [];
      }
    }

    class Eyedropper extends Tool{
      constructor(){
        super();
        this.singleAction = true;
        this.name = 'eyedropper';
        this.enum = ToolTypes.get('eyedropper');
        this.weight = 70;
        this.icon = 'M12.142 13.178l1.506 1.318-6.83 7.6c-1.31 1.464-2.22.315-3.953 1.647-.232.178-.483.257-.724.257-.601 0-1.141-.49-1.141-1.151 0-.218.062-.455.196-.698.978-1.791-.129-2.629 1.148-4.052l6.787-7.555 1.505 1.317-3.727 4.139h2.691l2.542-2.822zm5.764-13.178c-2.434 0-4.871 1.707-4.797 5.831.021 1.167-.356 1.698-.884 1.698-.298 0-.597-.169-.877-.386-.407-.315-.99-.26-1.331.129-.374.426-.329 1.076.096 1.448l5.253 4.598c.423.371 1.067.328 1.438-.096.343-.392.32-.979-.049-1.345-.277-.275-.501-.581-.501-.913 0-.479.486-.876 1.572-1.002 3.69-.428 5.174-2.656 5.174-4.88 0-2.799-2.149-5.082-5.094-5.082z';
        this.cursor = new Cursor({
          icon: 'M12.142 13.178l1.506 1.318-6.83 7.6c-1.31 1.464-2.22.315-3.953 1.647-.232.178-.483.257-.724.257-.601 0-1.141-.49-1.141-1.151 0-.218.062-.455.196-.698.978-1.791-.129-2.629 1.148-4.052l6.787-7.555 1.505 1.317-3.727 4.139h2.691l2.542-2.822zm5.764-13.178c-2.434 0-4.871 1.707-4.797 5.831.021 1.167-.356 1.698-.884 1.698-.298 0-.597-.169-.877-.386-.407-.315-.99-.26-1.331.129-.374.426-.329 1.076.096 1.448l5.253 4.598c.423.371 1.067.328 1.438-.096.343-.392.32-.979-.049-1.345-.277-.275-.501-.581-.501-.913 0-.479.486-.876 1.572-1.002 3.69-.428 5.174-2.656 5.174-4.88 0-2.799-2.149-5.082-5.094-5.082z',
          size: {
            width: 46,
            height: 46,
          },
          offset: {
            x: 0, 
            y: 10
          }  
        });
      }
      primary(props){
        const { x, y } = props.realMousePosition;
        // set active color index
        const colorIndex = Spritesheets.stores.activeLayer.get().colorIndexAtPosition(x, y);
        if(Number.isInteger(colorIndex)){
          Palettes.stores.selectedColor.set(colorIndex);
        }
      }
      secondary(props){}
      move(props){
        // update cursor position
        cursor.x = props.realMousePosition.x;
        cursor.y = props.realMousePosition.y;
        
      }
    }

    class Paintbucket extends Tool{
      constructor(){
        super();
        this.pixelIndicator = true;
        this.singleAction = true;
        this.name = 'paintbucket';
        this.enum = ToolTypes.get('paintbucket');
        this.weight = 80;
        this.icon = 'M24 19.007c0-3.167-1.409-6.771-2.835-9.301l-.006-.01-.014-.026c-.732-1.392-1.914-3.052-3.619-4.757-2.976-2.976-5.476-3.912-6.785-3.913-.413 0-.708.094-.859.245l-.654.654c-1.898-.236-3.42.105-4.294.982-.876.875-1.164 2.159-.792 3.524.242.893.807 1.891 1.752 2.836.867.867 2.062 1.684 3.615 2.327.488-.839 1.654-1.019 2.359-.315.586.586.584 1.533-.002 2.119s-1.533.589-2.121 0c-.229-.229-.366-.515-.416-.812-1.646-.657-3.066-1.534-4.144-2.612-.728-.728-1.289-1.528-1.664-2.349l-2.835 2.832c-.445.447-.685 1.064-.686 1.82.001 1.635 1.122 3.915 3.714 6.506 2.764 2.764 5.58 4.243 7.431 4.243.649 0 1.181-.195 1.548-.562l8.086-8.079c.911.875-.777 3.541-.777 4.65 0 1.104.896 1.999 2 1.998 1.104 0 1.998-.895 1.998-2zm-18.912-12.974c-.236-.978-.05-1.845.554-2.444.526-.53 1.471-.791 2.656-.761l-3.21 3.205zm9.138 2.341l-.03-.029c-1.29-1.291-3.802-4.354-3.095-5.062.715-.715 3.488 1.521 5.062 3.095.862.863 2.088 2.248 2.938 3.459-1.718-1.073-3.493-1.469-4.875-1.463zm-3.875 12.348c-.547-.082-1.5-.547-1.9-.928l7.086-7.086c.351.37 1.264.931 1.753 1.075l-6.939 6.939z';
        this.cursor = new Cursor({
          icon: 'M24 19.007c0-3.167-1.409-6.771-2.835-9.301l-.006-.01-.014-.026c-.732-1.392-1.914-3.052-3.619-4.757-2.976-2.976-5.476-3.912-6.785-3.913-.413 0-.708.094-.859.245l-.654.654c-1.898-.236-3.42.105-4.294.982-.876.875-1.164 2.159-.792 3.524.242.893.807 1.891 1.752 2.836.867.867 2.062 1.684 3.615 2.327.488-.839 1.654-1.019 2.359-.315.586.586.584 1.533-.002 2.119s-1.533.589-2.121 0c-.229-.229-.366-.515-.416-.812-1.646-.657-3.066-1.534-4.144-2.612-.728-.728-1.289-1.528-1.664-2.349l-2.835 2.832c-.445.447-.685 1.064-.686 1.82.001 1.635 1.122 3.915 3.714 6.506 2.764 2.764 5.58 4.243 7.431 4.243.649 0 1.181-.195 1.548-.562l8.086-8.079c.911.875-.777 3.541-.777 4.65 0 1.104.896 1.999 2 1.998 1.104 0 1.998-.895 1.998-2zm-18.912-12.974c-.236-.978-.05-1.845.554-2.444.526-.53 1.471-.791 2.656-.761l-3.21 3.205zm9.138 2.341l-.03-.029c-1.29-1.291-3.802-4.354-3.095-5.062.715-.715 3.488 1.521 5.062 3.095.862.863 2.088 2.248 2.938 3.459-1.718-1.073-3.493-1.469-4.875-1.463zm-3.875 12.348c-.547-.082-1.5-.547-1.9-.928l7.086-7.086c.351.37 1.264.931 1.753 1.075l-6.939 6.939z',
          offset: {
            x: 3.5, 
            y: 11
          },
          size: {
            width: 46,
            height: 46,
          },
        });

        // properties 
        this.properties = {
          diagonals: false,
        };
      }
      fillAllPixelsOfSameColor(x, y){
        throw new Error('Not implemented: fills all pixels')
      }
      fill(x, y){
        // fill value 
        const fillValue = Palettes.stores.selectedColor.get();
        // starting color
        const pixelValue = Spritesheets.stores.activeLayer.get().colorIndexAtPosition(x, y); 
        // store pixels in an array
        const pixels = [{ x, y }];
       
        while(pixels.length > 0){
          const { x: _x, y: _y} = pixels.shift();
          if(_y < 0 || _y > 127){
            continue;
          }
          if(_x < 0 || _x > 127){
            continue;
          }
          const colorIndex = Spritesheets.stores.activeLayer.get().colorIndexAtPosition(_x, _y);
          // make sure it's the same colorIndex
          if(colorIndex == fillValue){
            continue;
          }
          if(colorIndex != pixelValue){
            continue;
          }
          
          // upate color index
          Spritesheets.stores.activeLayer.get().setColorIndexAtPosition(_x, _y, fillValue);

          // check top, down, left, right directions
          pixels.push({ x: _x, y: _y + 1 });
          pixels.push({ x: _x, y: _y - 1 });
          pixels.push({ x: _x - 1, y: _y });
          pixels.push({ x: _x + 1, y: _y });

          // if we also want diagonals
          // TODO: implement this in the sub toolbar as options where the user
          // am able to toggle this preference
          if(this.properties.diagonals){
            pixels.push({ x: _x + 1, y: _y + 1 });
            pixels.push({ x: _x - 1, y: _y - 1 });
            pixels.push({ x: _x + 1, y: _y - 1 });
            pixels.push({ x: _x - 1, y: _y + 1 });
          }
        }

        // force a spritesheet update
        Spritesheets.stores.activeLayer.get().drawFromSource(Palettes.stores.activeLayer.get());
      }

      primary(props){
        const { x, y } = props.realMousePosition;
        if(!props.ctrlKey){
          this.fill(x, y);
        }else {
          this.fillAllPixelsOfSameColor(x, y);
        }
      }

      secondary(props){}

      move(props){
        // update cursor position
        cursor.x = props.realMousePosition.x;
        cursor.y = props.realMousePosition.y;
      }
    }

    // import Colorswap from './colorswap.js';
    // import Tileswap from './tileswap.js';
    // import Transform from './transform.js';
    // import Marquee from './tools/marquee.js';
    // import Zoom from './zoom.js';
    // import Preview from './tools/preview.js';
    // import PreviewRegion from './previewregion.js';
    // import Tilecolor from './tilecolor.js';

    const mapped = {
      pointer: new Pointer(),
      pen: new Pen(),
      eyedropper: new Eyedropper(),
      paintbucket: new Paintbucket(),
      // [colorswap]: new Colorswap(),
      // [tileswap]: new Tileswap(),
      // [transform]: new Transform(),
      // marquee: new Marquee(),
      // [zoom]: new Zoom(),
      // preview: new Preview(),
      // [preview_region]: new PreviewRegion(),
      // [tilecolor]: new Tilecolor()
    };

    const Toolbar = {
      tools: mapped, 
      activeTool: writable$1(undefined, ({ value, store, get }) => {
        return {
          setActive(_enum){
            if(!(_enum instanceof Enum)){
              throw new Error(`Invalid tool`);
            }
            const instance = mapped[_enum.key];
            const { cursor } = instance;
            // fallback cursor
            let type = 'default';
            // overwrite cursor if one is defined on the tool
            if(cursor && cursor.icon){
              type = `url("data:image/svg+xml,%3Csvg transform='' xmlns='http://www.w3.org/2000/svg' width='${cursor.size.width}' height='${cursor.size.height}' viewBox='0 0 100 100' xml:space='preserve'%3E %3Cpath fill='white' d='${cursor.icon}'/%3E %3C/svg%3E") ${cursor.offset.x} ${cursor.offset.y}, auto`;
            }
            // set new icon to css variable
            document.documentElement.style.setProperty('--canvas-cursor', type);
            store.set(instance);
          }
        }
      })
    };

    Toolbar.activeTool.setActive(ToolTypes.get('pen'));

    // tool actions
    const execute = (t, ...args) => {
      if(t){
        t.call(Toolbar.activeTool.get(), ...args);
      }
    };

    const primary = (...args) => execute(Toolbar.activeTool.get()?.primary, ...args);
    const secondary = (...args) => execute(Toolbar.activeTool.get()?.secondary, ...args);
    const move = (...args) => execute(Toolbar.activeTool.get()?.move, ...args);
    const mouseup = (...args) => execute(Toolbar.activeTool.get()?.mouseup, ...args);

    // sub stores
    const { selectedColor: selectedColor$1 } = Palettes.stores;


    // electron only actions 
    if(globalThis.electron){
      actions.register('window_close', _ => globalThis.electron.quit());
      actions.register('window_minimize', _ => globalThis.electron.minimize());
      actions.register('window_maximize', _ => globalThis.electron.maximize());
      actions.register('window_toggle_fullscreen', _ => globalThis.electron.toggleFullscreen());
      // external links
      actions.register('external_link', href => globalThis.electron.externalLink(href));

      // palettes
      actions.register('palette_export', async _ => {
        const data = palettesStore.export(true);
        const { canceled, filePath } = await globalThis.electron.openSaveDialog([Config.filetypes.palettes.save.extension]);
        if(!canceled && typeof filePath == 'string'){
          await globalThis.electron.saveAs(filePath, data);
        }
      });

      // import from file
      actions.register('palette_import', async _ => {
        const { canceled, filePaths } = await globalThis.electron.openFileDialog([Config.filetypes.palettes.save.extension]);
        if(!canceled && Array.isArray(filePaths)){
          for(const path of filePaths){
            const { filePath, data } = await globalThis.electron.readFileDataFromPath(path, 'utf8');
            palettesStore.import(data);
          }
        }
      });
    }

    // webapp only actions
    if(!globalThis.electron){
      actions.register('window_close', _ => _);
      actions.register('window_minimize', _ => _);
      actions.register('window_maximize', _ => actions.execute('window_toggle_fullscreen'));
      
      actions.register('window_toggle_fullscreen', () => {
        if(!document.fullscreenElement){
          document.documentElement.requestFullscreen();
        }else {
          document.exitFullscreen();
        }
      });

      // palettes
      // import file programmatically in the webversion
      actions.register('palette_import', (e) => {
        fileDialog([Config.filetypes.palettes.save.extension], (data) => {
          Palettes.import(data);
        });
      });
      // export
      actions.register('palette_export', (e) => {
        saveDialog(filename('palette', Config.filetypes.palettes.save.extension), Palettes.export(true));
      });


      // spritesheets
      actions.register('spritesheet_import', (e) => {
        fileDialog([Config.filetypes.spritesheets.save.extension], (data) => {
          Spritesheets.import(data);
        });
      });

      actions.register('spritesheet_export', (e) => {
        saveDialog(filename('spritesheet', Config.filetypes.spritesheets.save.extension), Spritesheets.export(true));
      });

      actions.register('spritesheet_import_chr', (e) => {
        fileDialog(['chr'], (data) => {
          Spritesheets.importCHR(data);
        }, { readAs: 'arraybuffer' });
      });

      actions.register('spritesheet_export_chr', (e) => {  
        const { label, data } = Spritesheets.exportCHR();
        saveDialog(filename(label, 'chr'), data);
      });

      actions.register('spritesheet_export_png', (e) => {  
        Spritesheets.exportAsImage(({ blob, label, options }) => {
          saveDialog(filename(label, 'png'), blob, { mimetype: blob.type });
        });
      });

    }

    /*

      actions for both applications

    */
    // noop
    actions.register('noop', _ => _);
    // themes
    actions.register('toggle_theme', _ => document.documentElement.dataset.theme = document.documentElement.dataset.theme == 'dark' ? 'light' : 'dark');
    actions.register('light_theme', _ => document.documentElement.dataset.theme = 'light');
    actions.register('dark_theme', _ => document.documentElement.dataset.theme = 'dark');

    // palettes
    actions.register('palette_clear', _ => Palettes.stores.layers.clear());
    actions.register('palette_create', _ => Palettes.createLayer());
    actions.register('palette_remove', source => Palettes.removeLayer(source));
    actions.register('palette_clone_layer', source => Palettes.cloneLayer(source));
    actions.register('palette_clone_active_layer', _ => Palettes.cloneActiveLayer());
    actions.register('palette_make_layer_active', source => Palettes.makeLayerActive(source));
    actions.register('palette_swap_layers', ({ to, from }) => Palettes.stores.layers.swapLayers(to, from));
    actions.register('palette_update_layer_label', ({ source, label }) => Palettes.updateLayerLabel(source, label));
    actions.register('palette_active_color', n => selectedColor$1.setActiveColorIndex(n));

    // spritesheets
    actions.register('spritesheet_create', _ => Spritesheets.createLayer());
    actions.register('spritesheet_remove', index => Spritesheets.removeLayer(index));
    actions.register('spritesheet_clone_layer', source => Spritesheets.cloneLayer(source));
    actions.register('spritesheet_clone_active_layer', _ => Spritesheets.cloneActiveLayer());
    actions.register('spritesheet_make_layer_active', source => Spritesheets.makeLayerActive(source));
    actions.register('spritesheet_swap_layers', ({ to, from }) => Spritesheets.swapLayers(to, from));
    actions.register('spritesheet_update_layer_label', ({ source, label }) => Spritesheets.updateLayerLabel(source, label));
    actions.register('spritesheet_zoom', level => view.zoom(level));
    actions.register('spritesheet_zoom_in', _ => view.zoom(get_store_value(spritesheetsStore).zoom+1));
    actions.register('spritesheet_zoom_out', _ => view.zoom(get_store_value(spritesheetsStore).zoom-1));
    actions.register('spritesheet_zoom_reset', _ => view.zoom());
    actions.register('spritesheet_set_active_tool', _enum => Toolbar.activeTool.setActive(_enum));

    const prepare = (base, route) => {
      // prefix the base to always start with a '/' and remove trailing slash
      base = '/'+base.replace(/^[\/]+|[\/]+$/g, '');
      // strip multiple occurences of '/'
      route = (`${base}/${route}`).replace(/[\/]+/g, '/');
      // remove leading and trailing slashes
      route = route.replace(/^[\/]+|[\/]+$/g, '');
      // get if it's explicit or not. could be a factor when determining route based on it's size/weight 
      // in terms of what has presedent when two routes would've matched the same url
      const explicit = /\*$/.test(route);
      // if it's implicit or explicit
      const lazy = explicit ? (route = route.replace(/[\*]+$/g, ''), ''): '/?$';
      // store parameters
      const parameters = [];
      let index = 0;
      let regexpRoute = route.replace(/(:)?([^\\/]+)/g, (parameter, colonParameter, identifier) => {
        const [ param, boundValue ] = identifier.split('->');
        if(colonParameter){
          // check for duplicates
          const duplicates = parameters.filter(old => old.identifier == boundValue); 
          if(duplicates.length > 0){
            throw new Error(`Duplicated parameter. [${duplicates.map(_=>_.identifier)}]`);
          }
          // store parameter reference
          parameters.push({
            index: index++,
            parameter,
            identifier: param,
          });
          // bound parameter
          return boundValue ? `(${boundValue})` : `([^\/]+)`;
        }
        return `${parameter}`;
      });
      regexpRoute = `^/${regexpRoute}${lazy}`;
      return {
        base,
        route,
        regexpRoute,
        parameters,
      }
    };

    class Route{
      constructor(base, route, fn, middlewares = []){
        Object.assign(this, prepare(base, route));
        this.callback = fn;
        this.middlewares = middlewares;
      }
    }

    class Middleware{
      constructor(...props){
        this.props = props;
      }
      use(fn){
        if(typeof fn != 'function'){
          throw new Error(`Invalid Middleware use argument. Expecting 'function' got : '${typeof fn}'`); 
        }
        const f = (stack) => next => stack(fn.bind(this, ...this.props, next));
        this.execute = f(this.execute);
        return this;
      }
      execute(fn){
        return fn.call(null);
      }
    }

    class Request{
      constructor(props){
        Object.assign(this, {
          base: '',
          path: '',
          route: '',
          query: {},
          params: {},
          state: {}
        }, props);
      }
    }

    class Response{
      constructor(callbacks){
        Object.assign(this, callbacks);
      }
    }

    // router
    class Router{
      constructor(props){
        // store properties and freeze them so not to be able to get modified
        Object.freeze(this.__properties = {
          initial: undefined,
          base: '',
          state: {},
          ...props
        });
        // are we subscribing?
        this.__subscribing = false;
        // store
        this.__get = new Map();
        this.__catch = new Map();
        this.__use = new Set();
      }
      _register(routes, fn, middlewares, list){
        routes.map(route => {
          const r = new Route(this.__properties.base, route, fn, middlewares);
          if(list.has(r.regexpRoute)){
            throw new Error(`Route with same endpoint already exist. [${route}, /${list.get(r.regexpRoute).route}](${r.regexpRoute})`);
          }
          list.set(r.regexpRoute, r);
        });
        return routes;
      }
      _props(...args){
        let routes, fn, middlewares = [];
        if(args.length == 1){
          [ fn ] = args;
          routes = '*';
        }else if(args.length == 2){
          [ routes, fn ] = args;
        }else if(args.length > 2){
          routes = args.shift();
          fn = args.pop();
          middlewares = args;      
        }else {
          throw new Error(`Invalid number prop arguments.`);
        }
        routes = Array.isArray(routes) ? routes : [routes];
        return { routes, fn, middlewares };
      }
      _storeInList(fnName, list, ...args){
        const { routes, fn, middlewares } = this._props(...args);
        const parentRoutes = this._register(routes, fn, middlewares, list);
        // enable chaining to group sub routes to a main route
        // not needed since the routes are store as unique strings in the end 
        // but might be a nicer way to organize the implementation
        const ret = {
          [fnName]: (...innerArgs) => {
            const { routes: innerRoutes, fn: innerFn, middlewares: innerMiddlewares } = this._props(...innerArgs);
            parentRoutes.map(route => innerRoutes.map(_ => route + _).map(_ => this[fnName](_, ...[...innerMiddlewares, innerFn])));
            return ret;
          }
        };
        return ret;
      }
      get(...args){
        return this._storeInList('get', this.__get, ...args);
      }
      use(...args){
        const { routes, fn } = this._props(args);
        routes.map(url => this.__use.add(new Route(this.__properties.base, url, ...fn)));
      }
      catch(...args){
        return this._storeInList('catch', this.__catch, ...args);
      }
      _findRoute(url, list, data){
        for(let [ regexpRoute, RouteInstance ] of list){
          const parameters = url.match(new RegExp(regexpRoute, 'i'));
          if(parameters){
            parameters.shift();
            // update Route with new parameters
            let params = {};
            if(parameters.length > 0){
              // create a parameters object
              params = RouteInstance.parameters.reduce((obj, value, index) => {
                obj[value.identifier] = parameters[index];
                return obj;
              }, params);
            }
            // query parameters
            const urlParams = new URLSearchParams(window.location.search);
            const queryParameters = {};
            for(const [key, value] of urlParams.entries()){ 
              if(queryParameters[key]){
                if(Array.isArray(queryParameters[key])){
                  queryParameters[key].push(value);
                }else {
                  queryParameters[key] = [queryParameters[key], value];
                }
              }else {
                queryParameters[key] = value;
              }
            }
            // update request object
            const returnObject = { 
              RouteInstance,
              Request: new Request({
                path: url,
                route: '/' + RouteInstance.route,
                base: RouteInstance.base,
                query: queryParameters,
                params: params,
                state: { ...data },
              })
            };
            return returnObject;
          }
        }
      }
      execute(url, data = {}){
        if(typeof url != 'string'){
          throw new Error(`Invalid 'execute' argument. Expecting 'string'`);
        }
        if(!this.__subscribing){
          return;
        }
        const response = new Response({
          send: (...props) => this.__router_callback.call(null, ...props),
          error: (props) => {
            const errorsFound = this._findRoute(url, this.__catch, data);
            if(!errorsFound){
              console.warn(`No route or catch fallbacks found for [${url}]`);
              return;
            }
            errorsFound.RouteInstance.callback.call(null, errorsFound.Request, response, props);
          }
        });
        let matchFound = this._findRoute(url, this.__get, data);
        if(!matchFound){
          response.error();
          return;
        }
        let middlewares = [];
        const middleware = new Middleware(matchFound.Request, response);
        this.__use.forEach(middlewareRoute => {
          const RouteInstance = url.match(new RegExp(middlewareRoute.regexpRoute, 'i'));
          if(RouteInstance){
            middlewares.push(middlewareRoute.callback);
          }
        });
        middlewares = [...middlewares, ...matchFound.RouteInstance.middlewares, matchFound.RouteInstance.callback];
        middlewares.map(fn => middleware.use(fn));
        // execute middleware
        middleware.execute();
      }
      subscribe(fn){
        this.__subscribing = true;
        if(typeof fn == 'function'){
          this.__router_callback = fn;
        }
        if(this.__properties.initial){
          this.execute(this.__properties.initial, this.__properties.state);
        }
        return () => {
          this.__subscribing = false;
        }
      }
    }

    class SvelteStandaloneRouterError extends Error{}
    class SvelteRouter extends Router{}

    // setting a singleton class with properties for 'global' access
    let Router$1 = new class RouterProperties{
      constructor(){
        this.__linkBase = '';
        this.__scrollReset = true;
        this.__scrollOffset = 0;
      }
      setLinkBase(value){
        if(typeof value != 'string'){
          throw new SvelteStandaloneRouterError(`Invalid 'linkBase'. Expecting value of type 'string'`);
        }
        return this.__linkBase = value.endsWith('/') ? value : value + '/';
      }
      set linkBase(value){
        return this.setLinkBase(value);
      }
      get linkBase(){
        return this.__linkBase;
      }
      
      // handle scroll reset
      setScrollReset(value){
        if(typeof value != 'boolean'){
          throw new SvelteStandaloneRouterError(`Invalid 'scrollReset'. Expecting value of type 'boolean'`);
        }
        return this.__scrollReset = value;
      }
      set scrollReset(value){
        return this.setScrollReset(value);
      }
      get scrollReset(){
        return this.__scrollReset;
      }

      // handle scroll reset
      setScrollOffset(value){
        if(typeof value != 'number'){
          throw new SvelteStandaloneRouterError(`Invalid 'scrollOffset'. Expecting value of type 'number'`);
        }
        return this.__scrollOffset = value;
      }
      set scrollOffset(value){
        return this.setScrollOffset(value);
      }
      get scrollOffset(){
        return this.__scrollOffset;
      }
    };

    // handle the linkBase in pathname
    const getPathname = (path) => {
      const re = new RegExp(`^${Router$1.linkBase}`, 'i');
      path = `/${path}/`.replace(/[\/]+/g, '/').replace(re, '').replace(/^\/|\/$/g, '');
      return '/' + path;
    };

    // dispatch custom event
    const dispatch = ({ state }) => {
      dispatchEvent(new CustomEvent('popstate', { 
        detail: {
          ...state
        } 
      }));
    };

    // navigate to a new page and pushing it to the History object
    const navigate = (url, state = {}) => {
      url = cleanURL(url);
      history.pushState(state, '', url);
      dispatch({ url, state }); 
    };

    // redirect to a new page and replacing it on the History object
    const redirect = (url, state = {}) => {
      url = cleanURL(url);
      history.replaceState(state, '', url);
      dispatch({ url, state });
    };

    // change url without route change and add it to the History
    const replace = (url, state = {}) => {
      history.pushState(state, '', cleanURL(url));
    };

    // change url without route change and DON'T add it to the History
    const alter = (url, state = {}) => {
      history.replaceState(state, '', cleanURL(url));
    };

    // replace all duplicate '/' that might be going on
    const cleanURL = (url) => `/${Router$1.linkBase}/${url}`.replace(/[\/]+/g, '/');

    // internal goto helper 
    const internalGoTo = (path, e) => {
      replace(getPathname(path));
      const hash = window.location.hash.slice(1);
      if(hash){
        if(e){
          e.preventDefault();
        }
        const element = document.querySelector(`a[name="${hash}"], #${hash}`);
        if(element){
          const topPos = element.getBoundingClientRect().top + window.pageYOffset - Router$1.scrollOffset;
          window.scrollTo({ top: topPos });
        }
      }
    };

    let prev = { location: { ...window.location }, firstLoad: false };
    let contexts = new Map();
    let location$1 = writable();

    let initialized = false;
    let firstLoad = false;

    // handle internal # links
    const internalLinksHandler = (e) => {
      const target = e.target;
      if(target.tagName == 'A'){
        const href = target.getAttribute('href');
        const isHashLink = href.indexOf('#') > -1;
        if(!(/^[a-zA-Z]+\:\/\/(.*)/.test(href)) && isHashLink){
          // go to position
          internalGoTo(href.startsWith('#') ? window.location.pathname + href : href, e);
          // update the prev data
          prev.location = { ...window.location };
        }
      }
    };

    // the popstate callback handler
    const popstateHandler = async e => {
      let endEarly = false;
      const sameURL = cleanURL(window.location.pathname + '/') == cleanURL(prev.location.pathname + '/') && prev.location.search == window.location.search;
      // don't continue if we are doing internal hash linking
      if(window.location.hash != '' && sameURL && prev.firstLoad){
        endEarly = true;
      }

      // if the hash is empty and not the same as the previous and it's on the same url we 
      // don't want to load a new page, then we simply end early and scroll to the top.
      if(window.location.hash == '' && window.location.hash != prev.location.hash && sameURL){
        endEarly = true;
        window.scrollTo({ top: 0 });
      }

      // if we don't end early we want to update the router contexts
      if(!endEarly){
        // update location and execute the router contexts
        location$1.set(getPathname(window.location.pathname));
        contexts.forEach(context => context.router.execute(window.location.pathname, e.detail));
      }

      // update the prev data
      prev.location = { ...window.location };
    };

    // if the popstate listener has been destroy 'mount' re-adds the listener 
    const mount = async () => {
      if(!initialized){
        // mark it initialized and update the location store with the current pathname
        initialized = true;
        if(!firstLoad){
          firstLoad = true;
          location$1.set(getPathname(window.location.pathname));
        }
        window.addEventListener('popstate', popstateHandler);
        window.addEventListener('click', internalLinksHandler);
      }
    };

    // export the context creator "wrapper"
    var context = (options) => {
      // mount on the first load to avoid having 
      // the user doing it manually
      mount();
      // creates a new context
      const router = new SvelteRouter(options);
      contexts.set(router, {
        component: writable(),
        router
      });
      return router;
    };

    /* node_modules\svelte-standalone-router\router.svelte generated by Svelte v3.31.2 */

    const { Error: Error_1 } = globals;

    const get_default_slot_changes = dirty => ({
    	component: dirty & /*$component*/ 1,
    	props: dirty & /*$component*/ 1,
    	decorator: dirty & /*$component*/ 1,
    	decoratorProps: dirty & /*$component*/ 1
    });

    const get_default_slot_context = ctx => ({
    	component: /*$component*/ ctx[0].context,
    	props: /*$component*/ ctx[0].props,
    	decorator: /*$component*/ ctx[0].decorator,
    	decoratorProps: /*$component*/ ctx[0].decoratorProps
    });

    // (54:0) {#if $component}
    function create_if_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], get_default_slot_context);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, $component*/ 17) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*$component*/ 1) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(54:0) {#if $component}",
    		ctx
    	});

    	return block;
    }

    // (60:4) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*$component*/ ctx[0].props];
    	var switch_value = /*$component*/ ctx[0].context;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$component*/ 1)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*$component*/ ctx[0].props)])
    			: {};

    			if (switch_value !== (switch_value = /*$component*/ ctx[0].context)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(60:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (56:4) {#if $component.decorator}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		/*$component*/ ctx[0].decoratorProps
    		? /*$component*/ ctx[0].decoratorProps
    		: {}
    	];

    	var switch_value = /*$component*/ ctx[0].decorator;

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$component*/ 1)
    			? get_spread_update(switch_instance_spread_levels, [
    					get_spread_object(/*$component*/ ctx[0].decoratorProps
    					? /*$component*/ ctx[0].decoratorProps
    					: {})
    				])
    			: {};

    			if (dirty & /*$$scope, $component*/ 17) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*$component*/ ctx[0].decorator)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(56:4) {#if $component.decorator}",
    		ctx
    	});

    	return block;
    }

    // (57:6) <svelte:component this={$component.decorator} {...($component.decoratorProps ? $component.decoratorProps : {})}>
    function create_default_slot(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*$component*/ ctx[0].props];
    	var switch_value = /*$component*/ ctx[0].context;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$component*/ 1)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*$component*/ ctx[0].props)])
    			: {};

    			if (switch_value !== (switch_value = /*$component*/ ctx[0].context)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(57:6) <svelte:component this={$component.decorator} {...($component.decoratorProps ? $component.decoratorProps : {})}>",
    		ctx
    	});

    	return block;
    }

    // (55:140)       
    function fallback_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$component*/ ctx[0].decorator) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(55:140)       ",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$component*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$component*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$component*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $component;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { context = contexts.keys().next().value } = $$props;

    	if (!context || !(context instanceof SvelteRouter)) {
    		throw new Error(`Invalid Router context. Did you initialize the component with a valid context?`);
    	}

    	const { component } = contexts.get(context);
    	validate_store(component, "component");
    	component_subscribe($$self, component, value => $$invalidate(0, $component = value));

    	context.subscribe(async (callback, props = {}, decorator = {}) => {
    		// a dirty check to see it is a "component". Since there is not way to check if it is a svelte component
    		// this would atleast force it to be a function and will catch most errors where a svelte component isn't passed
    		if (typeof callback != "function") {
    			throw new SvelteStandaloneRouterError(`Unable to load component. Did you pass a valid svelte component to the 'send' response?`);
    		}

    		// reset the scroll position depending on the static scrollReset value
    		if (Router$1.scrollReset) {
    			// always start from the top of the page
    			window.scrollTo({ top: 0 });
    		}

    		// update the writable store
    		component.set({
    			context: decorator
    			? callback
    			: class extends callback {
    					
    				},
    			decorator: !decorator.component
    			? undefined
    			: class extends decorator.component {
    					
    				},
    			decoratorProps: decorator.props || undefined,
    			props
    		});

    		// if we have visited a a url with a hash in it
    		// we need to await a tick so the component is loaded
    		// before we can scroll to that place in the dom
    		if (window.location.hash) {
    			await tick();

    			// but we also have this weird behaviour where the location pathname is
    			// not accessible so we need to pass it manually.
    			setTimeout(
    				() => {
    					internalGoTo(window.location.pathname + window.location.hash);
    				},
    				0
    			);
    		}

    		// flag that we have a first load
    		if (!prev.firstLoad) {
    			prev.firstLoad = true;
    		}
    	});

    	const writable_props = ["context"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("context" in $$props) $$invalidate(2, context = $$props.context);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		tick,
    		RouterContext: SvelteRouter,
    		Router: Router$1,
    		SvelteStandaloneRouterError,
    		contexts,
    		prev,
    		internalGoTo,
    		context,
    		component,
    		$component
    	});

    	$$self.$inject_state = $$props => {
    		if ("context" in $$props) $$invalidate(2, context = $$props.context);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$component, component, context, slots, $$scope];
    }

    class Router_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { context: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router_1",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get context() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set context(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var link = (element, props) => {
      props = {
        type: 'navigate',
        state: {},
        title: '',
        ...props
      };

      if(Router$1.linkBase){
        // first we need to clean the url and add the linkbase. Thats so one can right click and
        // open the page in a new tab or window and go to the right url
        const clean = cleanURL(element.getAttribute('href') || '');
        element.setAttribute('href', clean);
      }
      
      const clickHandler = (e) => {
        // make the check before preventing default behaviour since we should not block 
        // the default behaviour if we don't supply the required url string
        let url = props.to || props.href || e.currentTarget.getAttribute('href') || e.currentTarget.getAttribute('data-href');
        if(!url){
          return;
        }
        // here we need to only get the pathname without any linkbase
        // because that is handled in the navigational helpers
        url = getPathname(url);
        e.preventDefault();
        if(props.type == 'navigate'){
          navigate(url, props.state, props.title);
        }else if(props.type == 'redirect'){
          redirect(url, props.state, props.title);
        }else if(props.type == 'replace'){
          replace(url, props.state, props.title);
        }else if(props.type == 'alter'){
          alter(url, props.state, props.title);
        }else {
          console.warn(`Invalid 'use:link' type. Expecting 'navigate'(default), 'redirect', 'replace' or 'alter'`);
          return;
        }
      };
      element.addEventListener('click', clickHandler);
      return {
        update(parameters){
          props = {
            ...props,
            ...parameters
          };
        },
        destroy(){element.removeEventListener('click', clickHandler);}
      }
    };

    var decorator = (context, ...middleware) => {
      let decorator;
      // if no context is provided
      if(!(context instanceof SvelteRouter)){
        // then the context is actually the decorator
        decorator = context;
        // and so we get the first context from the context Map
        context = contexts.keys().next().value;
      }else {
        // but if we have a context the decorator is located at the first position
        // of the middlewares so we need to remove it and define it as the decorator
        decorator = middleware.shift();
      }
      if(!context){
        throw new Error(`Invalid Router context. Did you initialize the decorator with a valid context? or made sure to call it after one has been created?`);
      }
      // we need to keep track of the root url else 
      // everything would become nested one level deeper
      let root = '';
      const wrappedCall = (url, ...fns) => {
        // define the root of the chaining
        if(!root) root = url;
        let decoratorProps;
        let decoratorPropsCallback = (props) => {
          decoratorProps = { ...props };
        };
        const callback = fns.pop();
        context.get(url, ...[...middleware, ...fns], (req, res) => {
          callback(req, {
            send: (component, props) => {
              res.send(component, props, { component: decorator, props: decoratorProps });
            },
            error: res.error
          }, decoratorPropsCallback);
        });
        return {
          get: (_url, ...args) => wrappedCall(`${root}/${_url}`, ...args)
        };
      };
      return wrappedCall;
    };

    /* src\_views\GeneralError.svelte generated by Svelte v3.31.2 */

    const file = "src\\_views\\GeneralError.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "This page is not available";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Currently not available in this version of the application.";
    			add_location(h1, file, 1, 2, 27);
    			add_location(p, file, 2, 2, 66);
    			attr_dev(div, "class", "checkered svelte-19ubedp");
    			add_location(div, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GeneralError", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GeneralError> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class GeneralError extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GeneralError",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    // no sub dir for localhost
    if(!globalThis.electron && window.location.hostname !== 'localhost'){
      Router$1.linkBase = '/NESBitStudio-web';
    }
    // router context
    const app = context({ initial: window.location.pathname, base: Router$1.linkBase });

    // general fallback
    app.catch((req, res) => {
      res.send(GeneralError);
    });

    class Hotkey{
      constructor({keys, data, groups, options}){
        if(!Array.isArray(keys)){
          throw new Error(`Invalid keys. Expecting array of string representation values.`);
        }
        this.options = {
          ...options
        };
        this.groups = groups || [];
        this.signature = keys.toString();
        this.keys = keys;
        this.data = data;
        // callbacks
        this.__on;
        this.__off;
      }
      get callbacks(){
        return {
          on: this.__on,
          off: this.__off
        };
      }
      on(fn){
        if(typeof fn != 'function'){
          throw new Error(`Invalid 'off' function`);
        }
        this.__on = fn;
        return this;
      }
      off(fn){
        if(typeof fn != 'function'){
          throw new Error(`Invalid 'off' function`);
        }
        this.__off = fn;
        return this;
      }
    }

    class HotkeysManager{
      constructor(target, options){
        this.__options = {
          once: true,
          preventDefault: true,
          ...options
        };
        this.__registeredGroups = new Set();
        this.__enabledGroups = '__all__';
        this.__commands = new Map();
        this.__target = target;
      }
      get target(){
        return this.__target;
      }
      _prepare(arr){
        if(!Array.isArray(arr)){
          throw new Error(`Invalid '_prepare' argument. Expecting array, got : [${typeof arr}]`);
        }
        // sort the keys so they always end up in the same order
        return [...arr].map(key => key.toLowerCase()).sort((a, b) => {
          return a.toLowerCase().localeCompare(b.toLowerCase());
        });
      }
      enableAllGroups(){
        this.__enabledGroups = '__all__';
      }
      enableGroups(...groups){
        return [...this.__enabledGroups = [...groups]];
      }
      _find(command){
        // get all command values
        const commands = Array.from(this.__commands.values());
        // sort after priority
        commands.sort((a, b) => b.options.priority - a.options.priority);

        // filter all commands that includes any route
        let found;
        if(Array.isArray(this.__enabledGroups)){
          found = commands.find(KeyboardShortcut => {
            return KeyboardShortcut.groups.some(g => {
              // find a match which matches groups and signature
              if(!this.__enabledGroups || this.__enabledGroups.includes(g)){
                if(KeyboardShortcut.signature == command.toString()){
                  return true;
                }
              }
            });
          });
        // check if we have the __all__ wildcard and to simply look through every single command
        }else if(this.__enabledGroups == '__all__'){
          found = commands.find(KeyboardShortcut => KeyboardShortcut.signature == command.toString());
        }

        return found;
      }
      set(keySequence, { data, groups, ...props }){
        // check to see if groups is an array and has a size of at least 1
        // else return an array with one item which is the '*' wildcard
        // this will register one global entry
        groups = Array.isArray(groups) && groups.length > 0 ? groups : ['*'];
        // track all registered groups
        groups.map(group => this.__registeredGroups.add(group));
        const keys = this._prepare(keySequence);
        const shortcut = new Hotkey({
          keys, 
          data, 
          groups,
          options: { 
            priority: props.priority || 0,
            once: props.once || this.__options.once, 
            preventDefault: props.preventDefault || this.__options.preventDefault,
          }
        });

        // iterate over all groups and store a reference 
        groups.map(group => {
          if(this.__commands.get(`${group},${shortcut.signature}`)){
            throw new Error(`Shortcut already defined : [${group},${shortcut.signature}]`);
          }
          this.__commands.set(`${group},${shortcut.signature}`, shortcut);
        });

        return shortcut;
      }
      execute(command, state){
        // loop through command sequence and dispatch the events
        // which will execute the command like one pressed the keyboard
        // handle on state
        if(state == 'on' || state == undefined){
          const keys = {};
          command.map(key => keys[key.toLowerCase()] = true);
          const e = new Event("keydown");
          e.customExecuteEvent = keys;
          this.__target.dispatchEvent(e);
        }

        // handle off state
        if(state == 'off' || state == undefined){
          // release them
          command.map(key => {
            const e = new Event("keyup");
            e.code = key;
            this.__target.dispatchEvent(e);
          });
        }
      }
      subscribe(callback){
        let keys = {};
        let prevCommand = {};
        const keyDownHandler = (e) => {
          if(e.customExecuteEvent){
            keys = e.customExecuteEvent;
          }else {
            keys[e.code.toLowerCase()] = true;
          }
          // get all active keys
          const currentCommand = this._prepare(Object.entries(keys).filter(([k, v]) => v).map(([k, v]) => k.toLowerCase()));
          // store the previous command
          const match = this._find(currentCommand);
          // if we have a match go ahead and trigger the callback
          if(match){
            if(match.options.preventDefault){
              e.preventDefault();
            }
            // prevent command from executing over and over again if the option 'once' is defined
            if(match.options.once && currentCommand.toString() == prevCommand.signature){
              return;
            }
            
            // and store the command signature
            prevCommand = {
              instance: match,
              signature: currentCommand.toString()
            };
            // if the shortcut has on callback, execute that as well
            if(typeof match.callbacks.on == 'function'){
              match.callbacks.on.call(null, { e, Hotkey: match, on: true });
            }else {
              // call the callback
              if(typeof callback == 'function'){
                callback.call(null, { e, Hotkey: match, on: true });
              }
            }

          }
        };
        const keyUpHandler = e => {
          keys[e.code.toLowerCase()] = false; 
          if(prevCommand.instance && typeof prevCommand.instance.callbacks.off == 'function'){
            prevCommand.instance.callbacks.off.call(null, { e, Hotkey: prevCommand.instance, on: false });
          }else {
            // call the callback
            if(prevCommand.instance && typeof callback == 'function'){
              callback.call(null, { e, Hotkey: prevCommand.instance, on: false });
            }
          }


          prevCommand = {};
        };
        // 'keydown' since we want to trigger, shift, control, alt etc. 'keypress' does not
        this.__target.addEventListener('keydown', keyDownHandler);
        this.__target.addEventListener('keyup', keyUpHandler);

        // return unsubscribe method which in turn returns another subscribe method
        // to resubscribe with the same options if need be. 
        return () => {
          this.__target.removeEventListener('keyup', keyUpHandler);
          this.__target.removeEventListener('keydown', keyDownHandler);
          return _ => this.subscribe(this.__target, callback);
        }
      }
    }

    // shortcuts manager 
    const manager = new HotkeysManager(window, {
      // once: false,
    });


    manager.set(['ControlLeft', 'KeyO'], { data: { action: actions.action('noop') } });

    // subscribe to events
    manager.subscribe(({ e, Hotkey, on }) => {
      e.preventDefault();
      if(on && Hotkey.data && actions.exist(Hotkey.data.action)){
        actions.execute(Hotkey.data.action, Hotkey.data.props);
      }
    });

    // const execute command
    const executeCommand = ({ e, Hotkey, on }) => {
      e.preventDefault();
      if(on && Hotkey.data && actions.exist(Hotkey.data.action)){
        actions.execute(Hotkey.data.action);
      }
      // programmatically call keys up state
      manager.execute(Hotkey.keys, 'off');
    };

    /* src\_components\Tabmenu.svelte generated by Svelte v3.31.2 */

    const file$1 = "src\\_components\\Tabmenu.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let ul;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");
    			if (default_slot) default_slot.c();
    			attr_dev(ul, "id", "areanav");
    			attr_dev(ul, "class", "svelte-1vnr3x8");
    			add_location(ul, file$1, 1, 2, 21);
    			attr_dev(div, "id", "tabnav");
    			attr_dev(div, "class", "svelte-1vnr3x8");
    			add_location(div, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			if (default_slot) {
    				default_slot.m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tabmenu", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabmenu> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Tabmenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabmenu",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\_components\graphics\SectionNavigation.svelte generated by Svelte v3.31.2 */
    const file$2 = "src\\_components\\graphics\\SectionNavigation.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (14:2) {#each list as prop}
    function create_each_block(ctx) {
    	let li;
    	let button;
    	let t0_value = /*prop*/ ctx[2].label + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(button, "href", /*prop*/ ctx[2].href);
    			attr_dev(button, "label", /*prop*/ ctx[2].label);
    			attr_dev(button, "class", "svelte-1p6gkk9");
    			add_location(button, file$2, 15, 6, 553);
    			attr_dev(li, "class", "no-drag");
    			toggle_class(li, "active", /*prop*/ ctx[2].href == /*$location*/ ctx[0]);
    			add_location(li, file$2, 14, 4, 487);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = action_destroyer(link.call(null, button));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*list, $location*/ 3) {
    				toggle_class(li, "active", /*prop*/ ctx[2].href == /*$location*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(14:2) {#each list as prop}",
    		ctx
    	});

    	return block;
    }

    // (13:0) <Tabmenu>
    function create_default_slot$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*list*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*list, $location*/ 3) {
    				each_value = /*list*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(13:0) <Tabmenu>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let tabmenu;
    	let current;

    	tabmenu = new Tabmenu({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabmenu.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabmenu, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabmenu_changes = {};

    			if (dirty & /*$$scope, $location*/ 33) {
    				tabmenu_changes.$$scope = { dirty, ctx };
    			}

    			tabmenu.$set(tabmenu_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabmenu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $location;
    	validate_store(location$1, "location");
    	component_subscribe($$self, location$1, $$value => $$invalidate(0, $location = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SectionNavigation", slots, []);

    	const list = [
    		{
    			href: "/graphics/palettes",
    			label: "Palettes"
    		},
    		{
    			href: "/graphics/spritesheets",
    			label: "Spritesheets"
    		},
    		{
    			href: "/graphics/animations",
    			label: "Animations"
    		},
    		{
    			href: "/graphics/metatiles",
    			label: "Metatiles"
    		},
    		{
    			href: "/graphics/tilemaps",
    			label: "Tilemaps"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SectionNavigation> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link, location: location$1, Tabmenu, list, $location });
    	return [$location, list];
    }

    class SectionNavigation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SectionNavigation",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\_decorators\_Spritesheets.svelte generated by Svelte v3.31.2 */
    const file$3 = "src\\_decorators\\_Spritesheets.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let div0;
    	let sectionnavigation;
    	let t;
    	let div1;
    	let current;
    	sectionnavigation = new SectionNavigation({ $$inline: true });
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			create_component(sectionnavigation.$$.fragment);
    			t = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div0, file$3, 5, 2, 138);
    			attr_dev(div1, "class", "main svelte-10f6qa1");
    			add_location(div1, file$3, 8, 2, 184);
    			attr_dev(section, "id", "spritesheets");
    			attr_dev(section, "class", "svelte-10f6qa1");
    			add_location(section, file$3, 4, 0, 107);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			mount_component(sectionnavigation, div0, null);
    			append_dev(section, t);
    			append_dev(section, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionnavigation.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionnavigation.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(sectionnavigation);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Spritesheets", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spritesheets> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ SectionNavigation });
    	return [$$scope, slots];
    }

    class Spritesheets$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spritesheets",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\_decorators\_Palettes.svelte generated by Svelte v3.31.2 */
    const file$4 = "src\\_decorators\\_Palettes.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let div0;
    	let sectionnavigation;
    	let t;
    	let div1;
    	let current;
    	sectionnavigation = new SectionNavigation({ $$inline: true });
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			create_component(sectionnavigation.$$.fragment);
    			t = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div0, file$4, 5, 2, 134);
    			attr_dev(div1, "class", "main svelte-aj3pvw");
    			add_location(div1, file$4, 8, 2, 180);
    			attr_dev(section, "id", "palettes");
    			attr_dev(section, "class", "svelte-aj3pvw");
    			add_location(section, file$4, 4, 0, 107);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			mount_component(sectionnavigation, div0, null);
    			append_dev(section, t);
    			append_dev(section, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionnavigation.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionnavigation.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(sectionnavigation);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Palettes", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Palettes> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ SectionNavigation });
    	return [$$scope, slots];
    }

    class Palettes$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Palettes",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\_components\Artboard.svelte generated by Svelte v3.31.2 */
    const file$5 = "src\\_components\\Artboard.svelte";

    function create_fragment$6(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "content svelte-131dyyn");
    			add_location(div0, file$5, 116, 6, 3541);
    			attr_dev(div1, "class", "wrapper svelte-131dyyn");
    			add_location(div1, file$5, 115, 4, 3492);
    			attr_dev(div2, "class", "outer svelte-131dyyn");
    			add_location(div2, file$5, 114, 2, 3365);
    			attr_dev(div3, "class", "artboard svelte-131dyyn");
    			toggle_class(div3, "active", /*active*/ ctx[0]);
    			add_location(div3, file$5, 113, 0, 3282);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div1_binding*/ ctx[5](div1);
    			/*div2_binding*/ ctx[6](div2);
    			/*div3_binding*/ ctx[8](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "mousedown", /*downHandler*/ ctx[2], false, false, false),
    					listen_dev(div2, "wheel", /*wheel_handler*/ ctx[7], false, false, false),
    					listen_dev(div3, "wheel", /*scrollEvent*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (dirty & /*active*/ 1) {
    				toggle_class(div3, "active", /*active*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (default_slot) default_slot.d(detaching);
    			/*div1_binding*/ ctx[5](null);
    			/*div2_binding*/ ctx[6](null);
    			/*div3_binding*/ ctx[8](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let scroll, wrapper, artboard, mouseScroll = false;

    const centerScrollAndCanvas = () => {
    	scroll.scrollTo(wrapper.offsetWidth / 2 - scroll.offsetWidth / 2, wrapper.offsetHeight / 2 - scroll.offsetHeight / 2);
    };

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Artboard", slots, ['default']);
    	const dispatch = createEventDispatcher();

    	// any number other than 2 will displace the content on resize
    	let gutter = 2;

    	// lets use the resize handler as our way of knowing when the dom has 
    	// finished rendered because else we have to use the setTimeout hack 
    	// to push the centerScrollAndCanvas to the end of the queuestack
    	let firstLoad = false;

    	let active = false;

    	const resizeHandler = entries => {
    		for (const entry of entries) {
    			if (entry.contentRect) {
    				entry.contentRect;
    				const w = 4000;
    				const h = 4000;
    				const calc = { x: w * gutter, y: h * gutter };
    				wrapper.style.height = calc.y + "px";
    				wrapper.style.width = calc.x + "px";

    				// 
    				if (!firstLoad) {
    					firstLoad = true;
    					centerScrollAndCanvas();
    				}
    			}
    		}
    	};

    	const resizeObserver = new ResizeObserver(entries => resizeHandler(entries));

    	const scrollEvent = e => {
    		dispatch("artboardScrollEvent", e);
    	};

    	let startX, startY;
    	let scrollLeft, scrollTop;
    	let keyDowns = {};

    	const keyDown = e => {
    		e.preventDefault();
    		keyDowns[e.code] = true;
    	};

    	const keyUp = e => {
    		keyDowns[e.code] = false;
    	};

    	const downHandler = e => {
    		if (!(e.ctrlKey || keyDowns.Space)) {
    			if (e.which != 2) {
    				return;
    			}
    		}

    		e.stopImmediatePropagation();

    		// if we get this far prevent default behaviour
    		e.preventDefault();

    		$$invalidate(0, active = true);
    		startX = e.pageX - scroll.offsetLeft;
    		scrollLeft = scroll.scrollLeft;
    		startY = e.pageY - scroll.offsetTop;
    		scrollTop = scroll.scrollTop;
    	};

    	const upHandler = () => {
    		$$invalidate(0, active = false);
    	};

    	const moveHandler = e => {
    		if (!active) return;
    		e.preventDefault();
    		const x = e.pageX - scroll.offsetLeft;
    		const walk = (x - startX) * 1; //scroll-fast
    		scroll.scrollLeft = scrollLeft - walk;
    		const y = e.pageY - scroll.offsetTop;
    		const walky = (y - startY) * 1; //scroll-fast
    		scroll.scrollTop = scrollTop - walky;
    	};

    	onMount(() => {
    		document.addEventListener("keydown", keyDown);
    		document.addEventListener("keyup", keyUp);
    		resizeObserver.observe(artboard);

    		// centerScrollAndCanvas();
    		// add events 
    		// on:mousemove={moveHandler}
    		document.addEventListener("mousemove", moveHandler);

    		document.addEventListener("mouseup", upHandler);
    	});

    	onDestroy(() => {
    		document.removeEventListener("keydown", keyDown);
    		document.removeEventListener("keyup", keyUp);

    		// unsubscribe to all elements
    		resizeObserver.disconnect();

    		document.removeEventListener("mousemove", moveHandler);
    		document.removeEventListener("mouseup", upHandler);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Artboard> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			wrapper = $$value;
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			scroll = $$value;
    		});
    	}

    	const wheel_handler = e =>  e.preventDefault() ;

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			artboard = $$value;
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		scroll,
    		wrapper,
    		artboard,
    		mouseScroll,
    		centerScrollAndCanvas,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		dispatch,
    		gutter,
    		firstLoad,
    		active,
    		resizeHandler,
    		resizeObserver,
    		scrollEvent,
    		startX,
    		startY,
    		scrollLeft,
    		scrollTop,
    		keyDowns,
    		keyDown,
    		keyUp,
    		downHandler,
    		upHandler,
    		moveHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ("gutter" in $$props) gutter = $$props.gutter;
    		if ("firstLoad" in $$props) firstLoad = $$props.firstLoad;
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("startX" in $$props) startX = $$props.startX;
    		if ("startY" in $$props) startY = $$props.startY;
    		if ("scrollLeft" in $$props) scrollLeft = $$props.scrollLeft;
    		if ("scrollTop" in $$props) scrollTop = $$props.scrollTop;
    		if ("keyDowns" in $$props) keyDowns = $$props.keyDowns;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active,
    		scrollEvent,
    		downHandler,
    		$$scope,
    		slots,
    		div1_binding,
    		div2_binding,
    		wheel_handler,
    		div3_binding
    	];
    }

    class Artboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Artboard",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\_singles\buttons\ColorSelectButton.svelte generated by Svelte v3.31.2 */

    const file$6 = "src\\_singles\\buttons\\ColorSelectButton.svelte";

    function create_fragment$7(ctx) {
    	let button;
    	let div;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			div = element("div");
    			t = text(" ");
    			set_style(div, "--color", /*color*/ ctx[0]);
    			attr_dev(div, "class", "svelte-10hh6bt");
    			add_location(div, file$6, 6, 2, 140);
    			attr_dev(button, "class", "color-selector svelte-10hh6bt");
    			toggle_class(button, "selected", /*selected*/ ctx[1]);
    			add_location(button, file$6, 5, 0, 81);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, div);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 1) {
    				set_style(div, "--color", /*color*/ ctx[0]);
    			}

    			if (dirty & /*selected*/ 2) {
    				toggle_class(button, "selected", /*selected*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ColorSelectButton", slots, []);
    	let { color } = $$props;
    	let { selected = undefined } = $$props;
    	const writable_props = ["color", "selected"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ColorSelectButton> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({ color, selected });

    	$$self.$inject_state = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, selected, click_handler];
    }

    class ColorSelectButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { color: 0, selected: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorSelectButton",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*color*/ ctx[0] === undefined && !("color" in props)) {
    			console.warn("<ColorSelectButton> was created without expected prop 'color'");
    		}
    	}

    	get color() {
    		throw new Error("<ColorSelectButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ColorSelectButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<ColorSelectButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<ColorSelectButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\_components\graphics\ColorSelection.svelte generated by Svelte v3.31.2 */
    const file$7 = "src\\_components\\graphics\\ColorSelection.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (8:0) {#if $activeLayer}
    function create_if_block$1(ctx) {
    	let ul;
    	let current;
    	let each_value = /*$activeLayer*/ ctx[0].colors;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$7, 8, 2, 309);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$activeLayer, $selectedColor, ActionsManager*/ 3) {
    				each_value = /*$activeLayer*/ ctx[0].colors;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(8:0) {#if $activeLayer}",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#each $activeLayer.colors as color, i}
    function create_each_block$1(ctx) {
    	let li;
    	let colorselectbutton;
    	let t;
    	let current;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[4](/*i*/ ctx[7], ...args);
    	}

    	colorselectbutton = new ColorSelectButton({
    			props: {
    				color: /*color*/ ctx[5].rgb,
    				selected: /*$selectedColor*/ ctx[1] === /*i*/ ctx[7]
    			},
    			$$inline: true
    		});

    	colorselectbutton.$on("click", click_handler);

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(colorselectbutton.$$.fragment);
    			t = space();
    			add_location(li, file$7, 10, 6, 366);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(colorselectbutton, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const colorselectbutton_changes = {};
    			if (dirty & /*$activeLayer*/ 1) colorselectbutton_changes.color = /*color*/ ctx[5].rgb;
    			if (dirty & /*$selectedColor*/ 2) colorselectbutton_changes.selected = /*$selectedColor*/ ctx[1] === /*i*/ ctx[7];
    			colorselectbutton.$set(colorselectbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(colorselectbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(colorselectbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(colorselectbutton);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(10:4) {#each $activeLayer.colors as color, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeLayer*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeLayer*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeLayer*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $activeLayer;
    	let $selectedColor;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ColorSelection", slots, []);
    	const { activeLayer, selectedColor } = Palettes.stores;
    	validate_store(activeLayer, "activeLayer");
    	component_subscribe($$self, activeLayer, value => $$invalidate(0, $activeLayer = value));
    	validate_store(selectedColor, "selectedColor");
    	component_subscribe($$self, selectedColor, value => $$invalidate(1, $selectedColor = value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ColorSelection> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (i, _) => actions.execute("palette_active_color", i);

    	$$self.$capture_state = () => ({
    		ActionsManager: actions,
    		ColorSelectButton,
    		Palettes,
    		activeLayer,
    		selectedColor,
    		$activeLayer,
    		$selectedColor
    	});

    	return [$activeLayer, $selectedColor, activeLayer, selectedColor, click_handler];
    }

    class ColorSelection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorSelection",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\_singles\buttons\ToolButton.svelte generated by Svelte v3.31.2 */

    const file$8 = "src\\_singles\\buttons\\ToolButton.svelte";

    function create_fragment$9(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", "svelte-1j1cp6x");
    			toggle_class(button, "selected", /*selected*/ ctx[0]);
    			add_location(button, file$8, 4, 0, 47);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "dblclick", /*dblclick_handler*/ ctx[3], false, false, false),
    					listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (dirty & /*selected*/ 1) {
    				toggle_class(button, "selected", /*selected*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ToolButton", slots, ['default']);
    	let { selected } = $$props;
    	const writable_props = ["selected"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ToolButton> was created with unknown prop '${key}'`);
    	});

    	function dblclick_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ selected });

    	$$self.$inject_state = $$props => {
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, $$scope, slots, dblclick_handler, click_handler];
    }

    class ToolButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { selected: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToolButton",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selected*/ ctx[0] === undefined && !("selected" in props)) {
    			console.warn("<ToolButton> was created without expected prop 'selected'");
    		}
    	}

    	get selected() {
    		throw new Error("<ToolButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<ToolButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\_components\graphics\ToolbarSelection.svelte generated by Svelte v3.31.2 */

    const { Object: Object_1 } = globals;
    const file$9 = "src\\_components\\graphics\\ToolbarSelection.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (15:4) {#if tool.visible_in_toolbar}
    function create_if_block$2(ctx) {
    	let li;
    	let toolbutton;
    	let t;
    	let current;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[4](/*tool*/ ctx[6], ...args);
    	}

    	toolbutton = new ToolButton({
    			props: {
    				selected: /*$activeTool*/ ctx[0] === /*tool*/ ctx[6],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toolbutton.$on("dblclick", /*dblclick_handler*/ ctx[3]);
    	toolbutton.$on("click", click_handler);

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(toolbutton.$$.fragment);
    			t = space();
    			attr_dev(li, "class", "svelte-1pqmo8i");
    			add_location(li, file$9, 15, 6, 484);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(toolbutton, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const toolbutton_changes = {};
    			if (dirty & /*$activeTool*/ 1) toolbutton_changes.selected = /*$activeTool*/ ctx[0] === /*tool*/ ctx[6];

    			if (dirty & /*$$scope*/ 512) {
    				toolbutton_changes.$$scope = { dirty, ctx };
    			}

    			toolbutton.$set(toolbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toolbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toolbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(toolbutton);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(15:4) {#if tool.visible_in_toolbar}",
    		ctx
    	});

    	return block;
    }

    // (17:8) <ToolButton on:dblclick={_ => ActionsManager.execute('noop')} on:click={_ => ActionsManager.execute('spritesheet_set_active_tool', tool.enum)} selected={$activeTool === tool}>
    function create_default_slot$2(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", /*tool*/ ctx[6].icon);
    			add_location(path, file$9, 17, 93, 768);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "18");
    			attr_dev(svg, "height", "18");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$9, 17, 10, 685);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(17:8) <ToolButton on:dblclick={_ => ActionsManager.execute('noop')} on:click={_ => ActionsManager.execute('spritesheet_set_active_tool', tool.enum)} selected={$activeTool === tool}>",
    		ctx
    	});

    	return block;
    }

    // (14:2) {#each toolsList as tool}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*tool*/ ctx[6].visible_in_toolbar && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*tool*/ ctx[6].visible_in_toolbar) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(14:2) {#each toolsList as tool}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let ul;
    	let current;
    	let each_value = /*toolsList*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$9, 12, 0, 408);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$activeTool, toolsList, ActionsManager*/ 5) {
    				each_value = /*toolsList*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $activeTool;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ToolbarSelection", slots, []);
    	const { tools, activeTool } = Toolbar;
    	validate_store(activeTool, "activeTool");
    	component_subscribe($$self, activeTool, value => $$invalidate(0, $activeTool = value));

    	// get the values and sort after weight 
    	const toolsList = Object.values(tools);

    	toolsList.sort((a, b) => b.weight - a.weight);
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ToolbarSelection> was created with unknown prop '${key}'`);
    	});

    	const dblclick_handler = _ => actions.execute("noop");
    	const click_handler = (tool, _) => actions.execute("spritesheet_set_active_tool", tool.enum);

    	$$self.$capture_state = () => ({
    		ActionsManager: actions,
    		ToolButton,
    		Toolbar,
    		tools,
    		activeTool,
    		toolsList,
    		$activeTool
    	});

    	return [$activeTool, activeTool, toolsList, dblclick_handler, click_handler];
    }

    class ToolbarSelection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToolbarSelection",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\_components\graphics\SpritesheetToolbar.svelte generated by Svelte v3.31.2 */
    const file$a = "src\\_components\\graphics\\SpritesheetToolbar.svelte";

    function create_fragment$b(ctx) {
    	let section2;
    	let section0;
    	let toolbarselection;
    	let t;
    	let section1;
    	let colorselection;
    	let current;
    	toolbarselection = new ToolbarSelection({ $$inline: true });
    	colorselection = new ColorSelection({ $$inline: true });

    	const block = {
    		c: function create() {
    			section2 = element("section");
    			section0 = element("section");
    			create_component(toolbarselection.$$.fragment);
    			t = space();
    			section1 = element("section");
    			create_component(colorselection.$$.fragment);
    			attr_dev(section0, "class", "toolbar-section svelte-t490rv");
    			add_location(section0, file$a, 6, 2, 170);
    			attr_dev(section1, "class", "color-selector-section svelte-t490rv");
    			add_location(section1, file$a, 10, 2, 249);
    			attr_dev(section2, "class", "toolbar svelte-t490rv");
    			add_location(section2, file$a, 5, 0, 141);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section2, anchor);
    			append_dev(section2, section0);
    			mount_component(toolbarselection, section0, null);
    			append_dev(section2, t);
    			append_dev(section2, section1);
    			mount_component(colorselection, section1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toolbarselection.$$.fragment, local);
    			transition_in(colorselection.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toolbarselection.$$.fragment, local);
    			transition_out(colorselection.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section2);
    			destroy_component(toolbarselection);
    			destroy_component(colorselection);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SpritesheetToolbar", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SpritesheetToolbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ColorSelection, ToolbarSelection });
    	return [];
    }

    class SpritesheetToolbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SpritesheetToolbar",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\_singles\buttons\Button.svelte generated by Svelte v3.31.2 */
    const file$b = "src\\_singles\\buttons\\Button.svelte";

    // (13:93) placeholder
    function fallback_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("placeholder");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(13:93) placeholder",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	const default_slot_or_fallback = default_slot || fallback_block$1(ctx);
    	let button_levels = [{ role: "button" }, /*$$props*/ ctx[2]];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			set_attributes(button, button_data);
    			toggle_class(button, "danger", /*variant*/ ctx[0] == "danger");
    			toggle_class(button, "svelte-kdthmx", true);
    			add_location(button, file$b, 12, 0, 290);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [{ role: "button" }, dirty & /*$$props*/ 4 && /*$$props*/ ctx[2]]));
    			toggle_class(button, "danger", /*variant*/ ctx[0] == "danger");
    			toggle_class(button, "svelte-kdthmx", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { variant = undefined } = $$props;

    	const click = e => {
    		if (variant == "danger" && !(e.ctrlKey || e.altKey)) {
    			return;
    		}

    		dispatch("click");
    	};

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("variant" in $$new_props) $$invalidate(0, variant = $$new_props.variant);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		variant,
    		click
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("variant" in $$props) $$invalidate(0, variant = $$new_props.variant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [variant, click, $$props, $$scope, slots];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { variant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get variant() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*
        Shorten string to max amount of characters at nearest space

        @param String
        @param Number
        @param String
        @param Function

        @return String

        // Usage: 
        // const string = "Lorem ipsum dolor sit amet consectetur adipisicing elit.";
        // const paragraph = slim(string, 40, ' ', _ => _ + '...');
        // console.log(paragraph);
      */
     const slim = (s, n, char, fn) => {
      const o = s;
      if(n < o.length){
        const max = s.slice(0, n);
        s = max.slice(0, max.lastIndexOf(char));
      }
      if(typeof fn === 'function'){
        s = fn.call(null, s, o, char);
      }
      return s;
    };

    /* src\_components\LabelHeading.svelte generated by Svelte v3.31.2 */
    const file$c = "src\\_components\\LabelHeading.svelte";

    // (98:8) Label
    function fallback_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Label");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$2.name,
    		type: "fallback",
    		source: "(98:8) Label",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
    	const default_slot_or_fallback = default_slot || fallback_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(div, "class", "heading svelte-moa0u7");
    			attr_dev(div, "spellcheck", "false");
    			toggle_class(div, "active", /*active*/ ctx[0]);
    			add_location(div, file$c, 96, 0, 2395);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(div, null);
    			}

    			/*div_binding*/ ctx[10](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*edit*/ ctx[1], false, false, false),
    					listen_dev(div, "focus", /*focus*/ ctx[3], false, false, false),
    					listen_dev(div, "blur", /*blur*/ ctx[5], false, false, false),
    					listen_dev(div, "keydown", /*validateInput*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (dirty & /*active*/ 1) {
    				toggle_class(div, "active", /*active*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			/*div_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LabelHeading", slots, ['default']);
    	let { active } = $$props;
    	let { label } = $$props;
    	let { iconIndicator } = $$props;
    	const dispatch = createEventDispatcher();

    	// local properties
    	let element;

    	let previous = null;

    	const edit = e => {
    		e.preventDefault();
    		let once = false;

    		// handle single and doubleclicks. if detail is undefined assume it's called programatically
    		if (e.detail == 1 && e.target == element) {
    			dispatch("makeActive");

    			if (!once) {
    				once = true;
    				setTimeout(_ => once = false, 60);
    			}
    		} else {
    			$$invalidate(6, iconIndicator = false);
    			$$invalidate(2, element.contentEditable = true, element);
    			element.focus();
    		}
    	};

    	// on focusing label heading
    	const focus = _ => {
    		_.target.textContent = label;
    		const range = document.createRange();
    		const selection = window.getSelection();
    		range.selectNodeContents(_.target);
    		selection.removeAllRanges();
    		selection.addRange(range);
    	};

    	// on key down validate input
    	const validateInput = e => {
    		if (!previous) {
    			previous = e.currentTarget.textContent;
    		}

    		e.stopPropagation();
    		e.stopImmediatePropagation();

    		// escape
    		if (e.which == 27) {
    			e.currentTarget.textContent = previous;
    			e.preventDefault();
    			element.blur();
    			return;
    		}

    		// enter
    		if (e.which == 13) {
    			e.preventDefault();
    			element.blur();
    		}

    		// backspace, delete, left arrow, right arrow
    		if (e.which == 8 || e.which == 46 || e.which == 37 || e.which == 39) {
    			return;
    		}

    		// check valid character
    		const isValidCharacter = (/^[a-z\s]$/i).test(e.key);

    		if (!isValidCharacter && e.key !== "Backspace") {
    			e.preventDefault();
    			return;
    		}

    		// prevent to long labels
    		if (e.currentTarget.textContent.length > 20) {
    			e.preventDefault();
    		}
    	};

    	// on blurring
    	const blur = _ => {
    		previous = null;
    		$$invalidate(6, iconIndicator = true);
    		const v = _.target.textContent;
    		_.target.textContent = slim(v, 15, "", (n, o) => n != o ? n + "..." : n);
    		window.getSelection().removeAllRanges();
    		_.target.contentEditable = false;

    		// update the store entry with the new heading
    		dispatch("change", v);
    	};

    	const writable_props = ["active", "label", "iconIndicator"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LabelHeading> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(2, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("label" in $$props) $$invalidate(7, label = $$props.label);
    		if ("iconIndicator" in $$props) $$invalidate(6, iconIndicator = $$props.iconIndicator);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		slim,
    		active,
    		label,
    		iconIndicator,
    		dispatch,
    		element,
    		previous,
    		edit,
    		focus,
    		validateInput,
    		blur
    	});

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("label" in $$props) $$invalidate(7, label = $$props.label);
    		if ("iconIndicator" in $$props) $$invalidate(6, iconIndicator = $$props.iconIndicator);
    		if ("element" in $$props) $$invalidate(2, element = $$props.element);
    		if ("previous" in $$props) previous = $$props.previous;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active,
    		edit,
    		element,
    		focus,
    		validateInput,
    		blur,
    		iconIndicator,
    		label,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class LabelHeading extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			active: 0,
    			label: 7,
    			iconIndicator: 6,
    			edit: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LabelHeading",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*active*/ ctx[0] === undefined && !("active" in props)) {
    			console.warn("<LabelHeading> was created without expected prop 'active'");
    		}

    		if (/*label*/ ctx[7] === undefined && !("label" in props)) {
    			console.warn("<LabelHeading> was created without expected prop 'label'");
    		}

    		if (/*iconIndicator*/ ctx[6] === undefined && !("iconIndicator" in props)) {
    			console.warn("<LabelHeading> was created without expected prop 'iconIndicator'");
    		}
    	}

    	get active() {
    		throw new Error("<LabelHeading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<LabelHeading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<LabelHeading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<LabelHeading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconIndicator() {
    		throw new Error("<LabelHeading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconIndicator(value) {
    		throw new Error("<LabelHeading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get edit() {
    		return this.$$.ctx[1];
    	}

    	set edit(value) {
    		throw new Error("<LabelHeading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\_singles\buttons\ActionButton.svelte generated by Svelte v3.31.2 */

    const file$d = "src\\_singles\\buttons\\ActionButton.svelte";

    function create_fragment$e(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", "svelte-1dsxcgu");
    			toggle_class(button, "danger", /*variant*/ ctx[0] == "danger");
    			add_location(button, file$d, 4, 0, 58);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (dirty & /*variant*/ 1) {
    				toggle_class(button, "danger", /*variant*/ ctx[0] == "danger");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ActionButton", slots, ['default']);
    	let { variant = undefined } = $$props;
    	const writable_props = ["variant"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ActionButton> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("variant" in $$props) $$invalidate(0, variant = $$props.variant);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ variant });

    	$$self.$inject_state = $$props => {
    		if ("variant" in $$props) $$invalidate(0, variant = $$props.variant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [variant, $$scope, slots, click_handler];
    }

    class ActionButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { variant: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ActionButton",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get variant() {
    		throw new Error("<ActionButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<ActionButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // drag directive
    const drag = (node, props) => {
      if(!props || typeof props.type != 'string'){
        throw new Error(`Invalid 'drag' actions properties. Expecting 'type' of type 'string'`)
      }

      if(!props.value){
        throw new Error(`Invalid 'drag' actions value.`)
      }

      // enable the drag and drop api
      node.draggable = true;
      node.classList.add('draggable');
      const dragStart = (e) => {
        // don't let event propagate if we have possible nested drags
        e.stopImmediatePropagation();
        e.dataTransfer.setData(props.type, JSON.stringify(props.value || ''));
        // this is some hacky stuff. since on the canvas we listen for windows mouse events but dragdrop never fires
        // mouseup on release. so force it here if we start dragging something.
        window.dispatchEvent(new Event('mouseup'));
      };
      node.addEventListener('dragstart', dragStart);
      
    	return {
        destroy() {
          // remove listener
          node.removeEventListener('dragstart', dragStart);
        }
    	};
    };


    // drop directive
    const drop = (node, props) => {
      if(!props){
        throw new Error(`Invalid 'drop' actions props.`);
      }
      const callback = (key, pass) => {
        if(!props[key] && typeof props[key] != 'function'){
          if(!pass){
            throw new Error(`Invalid 'drop' callback : [${key}]`);
          }
          return;
        }
        return props[key];
      };
      // handle dragover
      const dragOver = (e) => {
        e.preventDefault();
        callback('over', true).call(null, e, node);
      };
      node.addEventListener('dragover', dragOver);
      const dragLeave = (e) => {
        callback('leave', true).call(null, e, node);    
      };
      node.addEventListener('dragleave', dragLeave);
      // handle dropping of items
      const drop = (e) => {
        callback('drop').call(null, { e, node, value: props.value });
      };
      node.addEventListener('drop', drop);

    	return {
    		destroy() {
          // remove listener
          node.removeEventListener('dragover', dragOver);
          node.removeEventListener('drop', drop);
        }
    	};
    };

    /* src\_components\Layer.svelte generated by Svelte v3.31.2 */

    const { console: console_1 } = globals;
    const file$e = "src\\_components\\Layer.svelte";

    // (54:4) <LabelHeading         {active}         label={source.label}         bind:iconIndicator         bind:this={heading}         on:makeActive={ e => dispatch('makeActive', source)}        on:change={e => dispatch('updateLabel', { source, value: e.detail })}>
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*label*/ ctx[5]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 32) set_data_dev(t, /*label*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(54:4) <LabelHeading         {active}         label={source.label}         bind:iconIndicator         bind:this={heading}         on:makeActive={ e => dispatch('makeActive', source)}        on:change={e => dispatch('updateLabel', { source, value: e.detail })}>",
    		ctx
    	});

    	return block;
    }

    // (63:4) {#if iconIndicator}
    function create_if_block$3(ctx) {
    	let div;
    	let actionbutton;
    	let t;
    	let current;

    	actionbutton = new ActionButton({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	actionbutton.$on("click", /*click_handler*/ ctx[19]);
    	let if_block = /*showEditButtons*/ ctx[2] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(actionbutton.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "icon-indicator svelte-7368bw");
    			add_location(div, file$e, 63, 6, 2041);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(actionbutton, div, null);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const actionbutton_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				actionbutton_changes.$$scope = { dirty, ctx };
    			}

    			actionbutton.$set(actionbutton_changes);

    			if (/*showEditButtons*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showEditButtons*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(actionbutton.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(actionbutton.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(actionbutton);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(63:4) {#if iconIndicator}",
    		ctx
    	});

    	return block;
    }

    // (65:8) <ActionButton on:click={e => heading.edit(e)}>
    function create_default_slot_2(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M19.769 9.923l-12.642 12.639-7.127 1.438 1.438-7.128 12.641-12.64 5.69 5.691zm1.414-1.414l2.817-2.82-5.691-5.689-2.816 2.817 5.69 5.692z");
    			attr_dev(path, "class", "svelte-7368bw");
    			add_location(path, file$e, 65, 93, 2220);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "12");
    			attr_dev(svg, "height", "12");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-7368bw");
    			add_location(svg, file$e, 65, 10, 2137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(65:8) <ActionButton on:click={e => heading.edit(e)}>",
    		ctx
    	});

    	return block;
    }

    // (68:10) {#if showEditButtons}
    function create_if_block_1$1(ctx) {
    	let actionbutton0;
    	let t;
    	let actionbutton1;
    	let current;

    	actionbutton0 = new ActionButton({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	actionbutton0.$on("click", /*cloneLayer*/ ctx[11]);

    	actionbutton1 = new ActionButton({
    			props: {
    				variant: "danger",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	actionbutton1.$on("click", /*removeLayer*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(actionbutton0.$$.fragment);
    			t = space();
    			create_component(actionbutton1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(actionbutton0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(actionbutton1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const actionbutton0_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				actionbutton0_changes.$$scope = { dirty, ctx };
    			}

    			actionbutton0.$set(actionbutton0_changes);
    			const actionbutton1_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				actionbutton1_changes.$$scope = { dirty, ctx };
    			}

    			actionbutton1.$set(actionbutton1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(actionbutton0.$$.fragment, local);
    			transition_in(actionbutton1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(actionbutton0.$$.fragment, local);
    			transition_out(actionbutton1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(actionbutton0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(actionbutton1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(68:10) {#if showEditButtons}",
    		ctx
    	});

    	return block;
    }

    // (69:12) <ActionButton on:click={cloneLayer}>
    function create_default_slot_1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M18 6v-6h-18v18h6v6h18v-18h-6zm-12 10h-4v-14h14v4h-10v10zm16 6h-14v-14h14v14zm-3-8h-3v-3h-2v3h-3v2h3v3h2v-3h3v-2z");
    			attr_dev(path, "class", "svelte-7368bw");
    			add_location(path, file$e, 69, 97, 2581);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "12");
    			attr_dev(svg, "height", "12");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-7368bw");
    			add_location(svg, file$e, 69, 14, 2498);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(69:12) <ActionButton on:click={cloneLayer}>",
    		ctx
    	});

    	return block;
    }

    // (72:12) <ActionButton on:click={removeLayer} variant="danger">
    function create_default_slot$3(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z");
    			attr_dev(path, "class", "svelte-7368bw");
    			add_location(path, file$e, 72, 97, 2908);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "12");
    			attr_dev(svg, "height", "12");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-7368bw");
    			add_location(svg, file$e, 72, 14, 2825);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(72:12) <ActionButton on:click={removeLayer} variant=\\\"danger\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div1;
    	let div0;
    	let labelheading;
    	let updating_iconIndicator;
    	let t0;
    	let t1;
    	let drag_action;
    	let drop_action;
    	let current;
    	let mounted;
    	let dispose;

    	function labelheading_iconIndicator_binding(value) {
    		/*labelheading_iconIndicator_binding*/ ctx[15].call(null, value);
    	}

    	let labelheading_props = {
    		active: /*active*/ ctx[8],
    		label: /*source*/ ctx[0].label,
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	};

    	if (/*iconIndicator*/ ctx[4] !== void 0) {
    		labelheading_props.iconIndicator = /*iconIndicator*/ ctx[4];
    	}

    	labelheading = new LabelHeading({
    			props: labelheading_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(labelheading, "iconIndicator", labelheading_iconIndicator_binding));
    	/*labelheading_binding*/ ctx[16](labelheading);
    	labelheading.$on("makeActive", /*makeActive_handler*/ ctx[17]);
    	labelheading.$on("change", /*change_handler*/ ctx[18]);
    	let if_block = /*iconIndicator*/ ctx[4] && create_if_block$3(ctx);
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[20], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(labelheading.$$.fragment);
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "panel-header svelte-7368bw");
    			add_location(div0, file$e, 52, 2, 1687);
    			attr_dev(div1, "class", "layer-item svelte-7368bw");
    			toggle_class(div1, "over", /*over*/ ctx[7]);
    			toggle_class(div1, "active", /*active*/ ctx[8]);
    			add_location(div1, file$e, 51, 0, 1525);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(labelheading, div0, null);
    			append_dev(div0, t0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div1, t1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(drag_action = drag.call(null, div1, {
    						type: "flipPalette",
    						value: { layerIndex: /*layerIndex*/ ctx[3] }
    					})),
    					action_destroyer(drop_action = drop.call(null, div1, {
    						.../*dropDirective*/ ctx[12],
    						value: { layerIndex: /*layerIndex*/ ctx[3] }
    					}))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const labelheading_changes = {};
    			if (dirty & /*active*/ 256) labelheading_changes.active = /*active*/ ctx[8];
    			if (dirty & /*source*/ 1) labelheading_changes.label = /*source*/ ctx[0].label;

    			if (dirty & /*$$scope, label*/ 1048608) {
    				labelheading_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_iconIndicator && dirty & /*iconIndicator*/ 16) {
    				updating_iconIndicator = true;
    				labelheading_changes.iconIndicator = /*iconIndicator*/ ctx[4];
    				add_flush_callback(() => updating_iconIndicator = false);
    			}

    			labelheading.$set(labelheading_changes);

    			if (/*iconIndicator*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*iconIndicator*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1048576) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[20], dirty, null, null);
    				}
    			}

    			if (drag_action && is_function(drag_action.update) && dirty & /*layerIndex*/ 8) drag_action.update.call(null, {
    				type: "flipPalette",
    				value: { layerIndex: /*layerIndex*/ ctx[3] }
    			});

    			if (drop_action && is_function(drop_action.update) && dirty & /*layerIndex*/ 8) drop_action.update.call(null, {
    				.../*dropDirective*/ ctx[12],
    				value: { layerIndex: /*layerIndex*/ ctx[3] }
    			});

    			if (dirty & /*over*/ 128) {
    				toggle_class(div1, "over", /*over*/ ctx[7]);
    			}

    			if (dirty & /*active*/ 256) {
    				toggle_class(div1, "active", /*active*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(labelheading.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(labelheading.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*labelheading_binding*/ ctx[16](null);
    			destroy_component(labelheading);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let active;

    	let $activeLayer,
    		$$unsubscribe_activeLayer = noop,
    		$$subscribe_activeLayer = () => ($$unsubscribe_activeLayer(), $$unsubscribe_activeLayer = subscribe(activeLayer, $$value => $$invalidate(13, $activeLayer = $$value)), activeLayer);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_activeLayer());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layer", slots, ['default']);
    	let { source = undefined } = $$props;
    	let { activeLayer = undefined } = $$props;
    	validate_store(activeLayer, "activeLayer");
    	$$subscribe_activeLayer();
    	let { showEditButtons = true } = $$props;
    	let { layerIndex = undefined } = $$props;
    	let iconIndicator = true;

    	// edit heading 
    	let label, heading;

    	const dispatch = createEventDispatcher();

    	// don't allow left-click remove
    	const removeLayer = e => {
    		if (e.ctrlKey || e.altKey) {
    			dispatch("remove", source);
    		} else {
    			// send notification modal that one has to use right-click or ctrl + click
    			console.warn(`Dispatch tooltip to let user know he has to hold down ctr or alt key`);
    		}
    	};

    	// dispatch clone event
    	const cloneLayer = e => dispatch("clone", source);

    	let over;

    	const dropDirective = {
    		over: _ => $$invalidate(7, over = true),
    		leave: _ => $$invalidate(7, over = false),
    		drop: ({ e, value }) => {
    			$$invalidate(7, over = false);
    			const flip = e.dataTransfer.getData("flipPalette");

    			if (flip) {
    				const n = Number(JSON.parse(flip).layerIndex);
    				dispatch("swapLayers", { to: n, from: value.layerIndex });
    			}
    		}
    	};

    	const writable_props = ["source", "activeLayer", "showEditButtons", "layerIndex"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Layer> was created with unknown prop '${key}'`);
    	});

    	function labelheading_iconIndicator_binding(value) {
    		iconIndicator = value;
    		$$invalidate(4, iconIndicator);
    	}

    	function labelheading_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			heading = $$value;
    			$$invalidate(6, heading);
    		});
    	}

    	const makeActive_handler = e => dispatch("makeActive", source);
    	const change_handler = e => dispatch("updateLabel", { source, value: e.detail });
    	const click_handler = e => heading.edit(e);

    	$$self.$$set = $$props => {
    		if ("source" in $$props) $$invalidate(0, source = $$props.source);
    		if ("activeLayer" in $$props) $$subscribe_activeLayer($$invalidate(1, activeLayer = $$props.activeLayer));
    		if ("showEditButtons" in $$props) $$invalidate(2, showEditButtons = $$props.showEditButtons);
    		if ("layerIndex" in $$props) $$invalidate(3, layerIndex = $$props.layerIndex);
    		if ("$$scope" in $$props) $$invalidate(20, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		LabelHeading,
    		ActionButton,
    		slim,
    		drag,
    		drop,
    		source,
    		activeLayer,
    		showEditButtons,
    		layerIndex,
    		iconIndicator,
    		label,
    		heading,
    		dispatch,
    		removeLayer,
    		cloneLayer,
    		over,
    		dropDirective,
    		active,
    		$activeLayer
    	});

    	$$self.$inject_state = $$props => {
    		if ("source" in $$props) $$invalidate(0, source = $$props.source);
    		if ("activeLayer" in $$props) $$subscribe_activeLayer($$invalidate(1, activeLayer = $$props.activeLayer));
    		if ("showEditButtons" in $$props) $$invalidate(2, showEditButtons = $$props.showEditButtons);
    		if ("layerIndex" in $$props) $$invalidate(3, layerIndex = $$props.layerIndex);
    		if ("iconIndicator" in $$props) $$invalidate(4, iconIndicator = $$props.iconIndicator);
    		if ("label" in $$props) $$invalidate(5, label = $$props.label);
    		if ("heading" in $$props) $$invalidate(6, heading = $$props.heading);
    		if ("over" in $$props) $$invalidate(7, over = $$props.over);
    		if ("active" in $$props) $$invalidate(8, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*source*/ 1) {
    			// reactive statements
    			 $$invalidate(5, label = slim(source.label, 15, "", (n, o) => n != o ? n + "..." : n));
    		}

    		if ($$self.$$.dirty & /*source, $activeLayer*/ 8193) {
    			 $$invalidate(8, active = source == $activeLayer);
    		}
    	};

    	return [
    		source,
    		activeLayer,
    		showEditButtons,
    		layerIndex,
    		iconIndicator,
    		label,
    		heading,
    		over,
    		active,
    		dispatch,
    		removeLayer,
    		cloneLayer,
    		dropDirective,
    		$activeLayer,
    		slots,
    		labelheading_iconIndicator_binding,
    		labelheading_binding,
    		makeActive_handler,
    		change_handler,
    		click_handler,
    		$$scope
    	];
    }

    class Layer$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			source: 0,
    			activeLayer: 1,
    			showEditButtons: 2,
    			layerIndex: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layer",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get source() {
    		throw new Error("<Layer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set source(value) {
    		throw new Error("<Layer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeLayer() {
    		throw new Error("<Layer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeLayer(value) {
    		throw new Error("<Layer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showEditButtons() {
    		throw new Error("<Layer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showEditButtons(value) {
    		throw new Error("<Layer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layerIndex() {
    		throw new Error("<Layer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layerIndex(value) {
    		throw new Error("<Layer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\_components\graphics\SpritesheetLayer.svelte generated by Svelte v3.31.2 */

    // (13:0) <Layer {...$$restProps} on:swapLayers={swapLayers} on:remove={removeLayer} on:updateLabel={updateLabel} on:makeActive={makeLayerActive} on:clone={cloneLayer}>
    function create_default_slot$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(13:0) <Layer {...$$restProps} on:swapLayers={swapLayers} on:remove={removeLayer} on:updateLabel={updateLabel} on:makeActive={makeLayerActive} on:clone={cloneLayer}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let layer;
    	let current;
    	const layer_spread_levels = [/*$$restProps*/ ctx[5]];

    	let layer_props = {
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < layer_spread_levels.length; i += 1) {
    		layer_props = assign(layer_props, layer_spread_levels[i]);
    	}

    	layer = new Layer$1({ props: layer_props, $$inline: true });
    	layer.$on("swapLayers", /*swapLayers*/ ctx[4]);
    	layer.$on("remove", /*removeLayer*/ ctx[0]);
    	layer.$on("updateLabel", /*updateLabel*/ ctx[1]);
    	layer.$on("makeActive", /*makeLayerActive*/ ctx[2]);
    	layer.$on("clone", /*cloneLayer*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(layer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(layer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const layer_changes = (dirty & /*$$restProps*/ 32)
    			? get_spread_update(layer_spread_levels, [get_spread_object(/*$$restProps*/ ctx[5])])
    			: {};

    			if (dirty & /*$$scope*/ 128) {
    				layer_changes.$$scope = { dirty, ctx };
    			}

    			layer.$set(layer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(layer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SpritesheetLayer", slots, ['default']);
    	const removeLayer = e => actions.execute("spritesheet_remove", e.detail);

    	const updateLabel = e => actions.execute("spritesheet_update_layer_label", {
    		source: e.detail.source,
    		label: e.detail.value
    	});

    	const makeLayerActive = e => actions.execute("spritesheet_make_layer_active", e.detail);
    	const cloneLayer = e => actions.execute("spritesheet_clone_layer", e.detail);
    	const swapLayers = e => actions.execute("spritesheet_swap_layers", e.detail);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("$$scope" in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ActionsManager: actions,
    		Spritesheets,
    		Layer: Layer$1,
    		removeLayer,
    		updateLabel,
    		makeLayerActive,
    		cloneLayer,
    		swapLayers
    	});

    	return [
    		removeLayer,
    		updateLabel,
    		makeLayerActive,
    		cloneLayer,
    		swapLayers,
    		$$restProps,
    		slots,
    		$$scope
    	];
    }

    class SpritesheetLayer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SpritesheetLayer",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\_components\graphics\CanvasPreview.svelte generated by Svelte v3.31.2 */
    const file$f = "src\\_components\\graphics\\CanvasPreview.svelte";

    function create_fragment$h(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "canvas-wrapper svelte-84zv5e");
    			add_location(div, file$f, 9, 0, 166);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[2](div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CanvasPreview", slots, []);
    	let { source } = $$props;
    	let wrapper;

    	onMount(() => {
    		wrapper.appendChild(source.element);
    	});

    	const writable_props = ["source"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CanvasPreview> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			wrapper = $$value;
    			$$invalidate(0, wrapper);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("source" in $$props) $$invalidate(1, source = $$props.source);
    	};

    	$$self.$capture_state = () => ({ onMount, source, wrapper });

    	$$self.$inject_state = $$props => {
    		if ("source" in $$props) $$invalidate(1, source = $$props.source);
    		if ("wrapper" in $$props) $$invalidate(0, wrapper = $$props.wrapper);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [wrapper, source, div_binding];
    }

    class CanvasPreview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { source: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CanvasPreview",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*source*/ ctx[1] === undefined && !("source" in props)) {
    			console.warn("<CanvasPreview> was created without expected prop 'source'");
    		}
    	}

    	get source() {
    		throw new Error("<CanvasPreview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set source(value) {
    		throw new Error("<CanvasPreview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\_components\graphics\SpritesheetLayers.svelte generated by Svelte v3.31.2 */
    const file$g = "src\\_components\\graphics\\SpritesheetLayers.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (21:4) {:else}
    function create_else_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "No spritesheets";
    			attr_dev(div, "class", "center svelte-1pdum4b");
    			add_location(div, file$g, 21, 6, 729);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(21:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:4) {#if $layers.length}
    function create_if_block$4(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*$layers*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*canvas*/ ctx[4].uuid;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$layers, activeLayer*/ 3) {
    				each_value = /*$layers*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$3, each_1_anchor, get_each_context$3);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(15:4) {#if $layers.length}",
    		ctx
    	});

    	return block;
    }

    // (17:8) <Layer source={canvas} activeLayer={activeLayer} {layerIndex}>
    function create_default_slot_1$1(ctx) {
    	let canvaspreview;
    	let t;
    	let current;

    	canvaspreview = new CanvasPreview({
    			props: { source: /*canvas*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(canvaspreview.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(canvaspreview, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const canvaspreview_changes = {};
    			if (dirty & /*$layers*/ 1) canvaspreview_changes.source = /*canvas*/ ctx[4];
    			canvaspreview.$set(canvaspreview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(canvaspreview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(canvaspreview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(canvaspreview, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(17:8) <Layer source={canvas} activeLayer={activeLayer} {layerIndex}>",
    		ctx
    	});

    	return block;
    }

    // (16:6) {#each $layers as canvas, layerIndex (canvas.uuid)}
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let layer;
    	let current;

    	layer = new SpritesheetLayer({
    			props: {
    				source: /*canvas*/ ctx[4],
    				activeLayer: /*activeLayer*/ ctx[1],
    				layerIndex: /*layerIndex*/ ctx[6],
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(layer.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(layer, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const layer_changes = {};
    			if (dirty & /*$layers*/ 1) layer_changes.source = /*canvas*/ ctx[4];
    			if (dirty & /*$layers*/ 1) layer_changes.layerIndex = /*layerIndex*/ ctx[6];

    			if (dirty & /*$$scope, $layers*/ 129) {
    				layer_changes.$$scope = { dirty, ctx };
    			}

    			layer.$set(layer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(layer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(16:6) {#each $layers as canvas, layerIndex (canvas.uuid)}",
    		ctx
    	});

    	return block;
    }

    // (29:4) <Button on:click={_ => ActionsManager.execute('spritesheet_create')}>
    function create_default_slot$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Create spritesheet");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(29:4) <Button on:click={_ => ActionsManager.execute('spritesheet_create')}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div2;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let div1;
    	let button;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$layers*/ ctx[0].length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[3]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if_block.c();
    			t = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "class", "layers svelte-1pdum4b");
    			add_location(div0, file$g, 13, 2, 453);
    			attr_dev(div1, "class", "center svelte-1pdum4b");
    			add_location(div1, file$g, 27, 2, 815);
    			attr_dev(div2, "class", "palette-layer svelte-1pdum4b");
    			add_location(div2, file$g, 11, 0, 420);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div0, null);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_blocks[current_block_type_index].d();
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $layers;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SpritesheetLayers", slots, []);
    	const { activeLayer, layers } = Spritesheets.stores;
    	validate_store(layers, "layers");
    	component_subscribe($$self, layers, value => $$invalidate(0, $layers = value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SpritesheetLayers> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => actions.execute("spritesheet_create");

    	$$self.$capture_state = () => ({
    		Button,
    		Layer: SpritesheetLayer,
    		CanvasPreview,
    		ActionsManager: actions,
    		Spritesheets,
    		activeLayer,
    		layers,
    		$layers
    	});

    	return [$layers, activeLayer, layers, click_handler];
    }

    class SpritesheetLayers extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SpritesheetLayers",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src\_components\graphics\PaletteLayer.svelte generated by Svelte v3.31.2 */

    // (12:0) <Layer {...$$restProps} on:swapLayers={swapLayers} on:remove={removeLayer} on:updateLabel={updateLabel} on:makeActive={makeLayerActive} on:clone={cloneLayer}>
    function create_default_slot$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(12:0) <Layer {...$$restProps} on:swapLayers={swapLayers} on:remove={removeLayer} on:updateLabel={updateLabel} on:makeActive={makeLayerActive} on:clone={cloneLayer}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let layer;
    	let current;
    	const layer_spread_levels = [/*$$restProps*/ ctx[5]];

    	let layer_props = {
    		$$slots: { default: [create_default_slot$6] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < layer_spread_levels.length; i += 1) {
    		layer_props = assign(layer_props, layer_spread_levels[i]);
    	}

    	layer = new Layer$1({ props: layer_props, $$inline: true });
    	layer.$on("swapLayers", /*swapLayers*/ ctx[4]);
    	layer.$on("remove", /*removeLayer*/ ctx[0]);
    	layer.$on("updateLabel", /*updateLabel*/ ctx[1]);
    	layer.$on("makeActive", /*makeLayerActive*/ ctx[2]);
    	layer.$on("clone", /*cloneLayer*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(layer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(layer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const layer_changes = (dirty & /*$$restProps*/ 32)
    			? get_spread_update(layer_spread_levels, [get_spread_object(/*$$restProps*/ ctx[5])])
    			: {};

    			if (dirty & /*$$scope*/ 128) {
    				layer_changes.$$scope = { dirty, ctx };
    			}

    			layer.$set(layer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(layer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PaletteLayer", slots, ['default']);
    	const removeLayer = e => actions.execute("palette_remove", e.detail);

    	const updateLabel = e => actions.execute("palette_update_layer_label", {
    		source: e.detail.source,
    		label: e.detail.value
    	});

    	const makeLayerActive = e => actions.execute("palette_make_layer_active", e.detail);
    	const cloneLayer = e => actions.execute("palette_clone_layer", e.detail);
    	const swapLayers = e => actions.execute("palette_swap_layers", e.detail);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("$$scope" in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ActionsManager: actions,
    		Layer: Layer$1,
    		removeLayer,
    		updateLabel,
    		makeLayerActive,
    		cloneLayer,
    		swapLayers
    	});

    	return [
    		removeLayer,
    		updateLabel,
    		makeLayerActive,
    		cloneLayer,
    		swapLayers,
    		$$restProps,
    		slots,
    		$$scope
    	];
    }

    class PaletteLayer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaletteLayer",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src\_singles\Color.svelte generated by Svelte v3.31.2 */
    const file$h = "src\\_singles\\Color.svelte";

    // (22:10) 0x
    function fallback_block$3(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("0x");
    			t1 = text(/*hex*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hex*/ 2) set_data_dev(t1, /*hex*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$3.name,
    		type: "fallback",
    		source: "(22:10) 0x",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let div;
    	let span;
    	let drag_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);
    	const default_slot_or_fallback = default_slot || fallback_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			set_style(span, "pointer-events", "none");
    			attr_dev(span, "class", "svelte-1j057y7");
    			add_location(span, file$h, 20, 2, 625);
    			attr_dev(div, "class", "color svelte-1j057y7");
    			attr_dev(div, "data-hex", /*hex*/ ctx[1]);
    			set_style(div, "--rgb", "rgb(" + /*rgb*/ ctx[0].join(",") + ")");
    			toggle_class(div, "active", /*$activeLayer*/ ctx[5] && /*colorIndex*/ ctx[4] == /*$selectedColor*/ ctx[6] && /*layerIndex*/ ctx[3] == Palettes.layerIndexFromSource(/*$activeLayer*/ ctx[5]));
    			add_location(div, file$h, 13, 0, 324);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(span, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*click_handler*/ ctx[11], false, false, false),
    					action_destroyer(drag_action = drag.call(null, div, {
    						type: /*type*/ ctx[2],
    						value: {
    							rgb: /*rgb*/ ctx[0],
    							hex: /*hex*/ ctx[1],
    							type: /*type*/ ctx[2],
    							layerIndex: /*layerIndex*/ ctx[3],
    							colorIndex: /*colorIndex*/ ctx[4]
    						}
    					}))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 512) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*hex*/ 2) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty & /*hex*/ 2) {
    				attr_dev(div, "data-hex", /*hex*/ ctx[1]);
    			}

    			if (!current || dirty & /*rgb*/ 1) {
    				set_style(div, "--rgb", "rgb(" + /*rgb*/ ctx[0].join(",") + ")");
    			}

    			if (drag_action && is_function(drag_action.update) && dirty & /*type, rgb, hex, layerIndex, colorIndex*/ 31) drag_action.update.call(null, {
    				type: /*type*/ ctx[2],
    				value: {
    					rgb: /*rgb*/ ctx[0],
    					hex: /*hex*/ ctx[1],
    					type: /*type*/ ctx[2],
    					layerIndex: /*layerIndex*/ ctx[3],
    					colorIndex: /*colorIndex*/ ctx[4]
    				}
    			});

    			if (dirty & /*$activeLayer, colorIndex, $selectedColor, layerIndex, Palettes*/ 120) {
    				toggle_class(div, "active", /*$activeLayer*/ ctx[5] && /*colorIndex*/ ctx[4] == /*$selectedColor*/ ctx[6] && /*layerIndex*/ ctx[3] == Palettes.layerIndexFromSource(/*$activeLayer*/ ctx[5]));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let $activeLayer;
    	let $selectedColor;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Color", slots, ['default']);
    	let { rgb } = $$props;
    	let { hex } = $$props;
    	let { type } = $$props;
    	let { layerIndex = undefined } = $$props;
    	let { colorIndex = undefined } = $$props;
    	const { selectedColor, activeLayer } = Palettes.stores;
    	validate_store(selectedColor, "selectedColor");
    	component_subscribe($$self, selectedColor, value => $$invalidate(6, $selectedColor = value));
    	validate_store(activeLayer, "activeLayer");
    	component_subscribe($$self, activeLayer, value => $$invalidate(5, $activeLayer = value));
    	const writable_props = ["rgb", "hex", "type", "layerIndex", "colorIndex"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Color> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("rgb" in $$props) $$invalidate(0, rgb = $$props.rgb);
    		if ("hex" in $$props) $$invalidate(1, hex = $$props.hex);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("layerIndex" in $$props) $$invalidate(3, layerIndex = $$props.layerIndex);
    		if ("colorIndex" in $$props) $$invalidate(4, colorIndex = $$props.colorIndex);
    		if ("$$scope" in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Palettes,
    		drag,
    		rgb,
    		hex,
    		type,
    		layerIndex,
    		colorIndex,
    		selectedColor,
    		activeLayer,
    		$activeLayer,
    		$selectedColor
    	});

    	$$self.$inject_state = $$props => {
    		if ("rgb" in $$props) $$invalidate(0, rgb = $$props.rgb);
    		if ("hex" in $$props) $$invalidate(1, hex = $$props.hex);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("layerIndex" in $$props) $$invalidate(3, layerIndex = $$props.layerIndex);
    		if ("colorIndex" in $$props) $$invalidate(4, colorIndex = $$props.colorIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		rgb,
    		hex,
    		type,
    		layerIndex,
    		colorIndex,
    		$activeLayer,
    		$selectedColor,
    		selectedColor,
    		activeLayer,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Color extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
    			rgb: 0,
    			hex: 1,
    			type: 2,
    			layerIndex: 3,
    			colorIndex: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Color",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*rgb*/ ctx[0] === undefined && !("rgb" in props)) {
    			console.warn("<Color> was created without expected prop 'rgb'");
    		}

    		if (/*hex*/ ctx[1] === undefined && !("hex" in props)) {
    			console.warn("<Color> was created without expected prop 'hex'");
    		}

    		if (/*type*/ ctx[2] === undefined && !("type" in props)) {
    			console.warn("<Color> was created without expected prop 'type'");
    		}
    	}

    	get rgb() {
    		throw new Error("<Color>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rgb(value) {
    		throw new Error("<Color>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hex() {
    		throw new Error("<Color>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hex(value) {
    		throw new Error("<Color>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Color>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Color>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layerIndex() {
    		throw new Error("<Color>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layerIndex(value) {
    		throw new Error("<Color>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colorIndex() {
    		throw new Error("<Color>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colorIndex(value) {
    		throw new Error("<Color>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\_components\graphics\PaletteLayers.svelte generated by Svelte v3.31.2 */

    const file$i = "src\\_components\\graphics\\PaletteLayers.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (50:4) {:else}
    function create_else_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "No palettes";
    			attr_dev(div, "class", "center svelte-njkqod");
    			add_location(div, file$i, 50, 6, 1606);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(50:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (38:4) {#if $layers && $layers.length}
    function create_if_block_1$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*$layers*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$layers, showEditButtons, activeLayer, colorDirective*/ 23) {
    				each_value = /*$layers*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(38:4) {#if $layers && $layers.length}",
    		ctx
    	});

    	return block;
    }

    // (44:16) <Color hex={color.hex} rgb={color.rgb} {layerIndex} {colorIndex} type="swap">
    function create_default_slot_2$1(ctx) {
    	let t0;
    	let t1_value = /*color*/ ctx[10].hex + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("0x");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$layers*/ 2 && t1_value !== (t1_value = /*color*/ ctx[10].hex + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(44:16) <Color hex={color.hex} rgb={color.rgb} {layerIndex} {colorIndex} type=\\\"swap\\\">",
    		ctx
    	});

    	return block;
    }

    // (42:12) {#each palette.colors as color, colorIndex (colorIndex)}
    function create_each_block_1(key_1, ctx) {
    	let li;
    	let color;
    	let t;
    	let drop_action;
    	let current;
    	let mounted;
    	let dispose;

    	color = new Color({
    			props: {
    				hex: /*color*/ ctx[10].hex,
    				rgb: /*color*/ ctx[10].rgb,
    				layerIndex: /*layerIndex*/ ctx[9],
    				colorIndex: /*colorIndex*/ ctx[12],
    				type: "swap",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			create_component(color.$$.fragment);
    			t = space();
    			attr_dev(li, "class", "svelte-njkqod");
    			add_location(li, file$i, 42, 14, 1306);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(color, li, null);
    			append_dev(li, t);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(drop_action = drop.call(null, li, {
    					.../*colorDirective*/ ctx[4],
    					value: {
    						layerIndex: /*layerIndex*/ ctx[9],
    						colorIndex: /*colorIndex*/ ctx[12]
    					}
    				}));

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const color_changes = {};
    			if (dirty & /*$layers*/ 2) color_changes.hex = /*color*/ ctx[10].hex;
    			if (dirty & /*$layers*/ 2) color_changes.rgb = /*color*/ ctx[10].rgb;
    			if (dirty & /*$layers*/ 2) color_changes.colorIndex = /*colorIndex*/ ctx[12];

    			if (dirty & /*$$scope, $layers*/ 8194) {
    				color_changes.$$scope = { dirty, ctx };
    			}

    			color.$set(color_changes);

    			if (drop_action && is_function(drop_action.update) && dirty & /*$layers*/ 2) drop_action.update.call(null, {
    				.../*colorDirective*/ ctx[4],
    				value: {
    					layerIndex: /*layerIndex*/ ctx[9],
    					colorIndex: /*colorIndex*/ ctx[12]
    				}
    			});
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(color.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(color.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(color);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(42:12) {#each palette.colors as color, colorIndex (colorIndex)}",
    		ctx
    	});

    	return block;
    }

    // (40:8) <Layer source={palette} {showEditButtons} activeLayer={activeLayer} {layerIndex}>
    function create_default_slot_1$2(ctx) {
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let current;
    	let each_value_1 = /*palette*/ ctx[7].colors;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*colorIndex*/ ctx[12];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(ul, "class", "svelte-njkqod");
    			add_location(ul, file$i, 40, 10, 1216);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*colorDirective, $layers*/ 18) {
    				each_value_1 = /*palette*/ ctx[7].colors;
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, ul, outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(40:8) <Layer source={palette} {showEditButtons} activeLayer={activeLayer} {layerIndex}>",
    		ctx
    	});

    	return block;
    }

    // (39:6) {#each $layers as palette, layerIndex}
    function create_each_block$4(ctx) {
    	let layer;
    	let current;

    	layer = new PaletteLayer({
    			props: {
    				source: /*palette*/ ctx[7],
    				showEditButtons: /*showEditButtons*/ ctx[0],
    				activeLayer: /*activeLayer*/ ctx[2],
    				layerIndex: /*layerIndex*/ ctx[9],
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(layer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(layer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const layer_changes = {};
    			if (dirty & /*$layers*/ 2) layer_changes.source = /*palette*/ ctx[7];
    			if (dirty & /*showEditButtons*/ 1) layer_changes.showEditButtons = /*showEditButtons*/ ctx[0];

    			if (dirty & /*$$scope, $layers*/ 8194) {
    				layer_changes.$$scope = { dirty, ctx };
    			}

    			layer.$set(layer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(layer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(39:6) {#each $layers as palette, layerIndex}",
    		ctx
    	});

    	return block;
    }

    // (57:4) {#if showEditButtons}
    function create_if_block$5(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(57:4) {#if showEditButtons}",
    		ctx
    	});

    	return block;
    }

    // (58:6) <Button on:click={_ => ActionsManager.execute('palette_create')}>
    function create_default_slot$7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Create palette");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(58:6) <Button on:click={_ => ActionsManager.execute('palette_create')}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div2;
    	let div0;
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let div1;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$layers*/ ctx[1] && /*$layers*/ ctx[1].length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*showEditButtons*/ ctx[0] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "layers svelte-njkqod");
    			add_location(div0, file$i, 36, 2, 1010);
    			attr_dev(div1, "class", "center svelte-njkqod");
    			add_location(div1, file$i, 55, 2, 1686);
    			attr_dev(div2, "class", "palette-layer svelte-njkqod");
    			add_location(div2, file$i, 35, 0, 979);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div0, null);
    			}

    			if (/*showEditButtons*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showEditButtons*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let $layers;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PaletteLayers", slots, []);
    	let { showEditButtons = true } = $$props;
    	const { activeLayer, layers } = Palettes.stores;
    	validate_store(layers, "layers");
    	component_subscribe($$self, layers, value => $$invalidate(1, $layers = value));
    	let over;

    	const colorDirective = {
    		over: _ => over = true,
    		leave: _ => over = false,
    		drop: ({ e, value }) => {
    			over = false;
    			const swap = e.dataTransfer.getData("swap");

    			if (swap) {
    				layers.swapColors({ ...JSON.parse(swap), to: { ...value } });
    			}

    			// handle replacement
    			const replace = e.dataTransfer.getData("replace");

    			if (replace) {
    				layers.replaceColor({ ...JSON.parse(replace), ...value });
    			}
    		}
    	};

    	const writable_props = ["showEditButtons"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PaletteLayers> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => actions.execute("palette_create");

    	$$self.$$set = $$props => {
    		if ("showEditButtons" in $$props) $$invalidate(0, showEditButtons = $$props.showEditButtons);
    	};

    	$$self.$capture_state = () => ({
    		Palettes,
    		Button,
    		Layer: PaletteLayer,
    		Color,
    		ActionsManager: actions,
    		drop,
    		showEditButtons,
    		activeLayer,
    		layers,
    		over,
    		colorDirective,
    		$layers
    	});

    	$$self.$inject_state = $$props => {
    		if ("showEditButtons" in $$props) $$invalidate(0, showEditButtons = $$props.showEditButtons);
    		if ("over" in $$props) over = $$props.over;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showEditButtons, $layers, activeLayer, layers, colorDirective, click_handler];
    }

    class PaletteLayers extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { showEditButtons: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaletteLayers",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get showEditButtons() {
    		throw new Error("<PaletteLayers>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showEditButtons(value) {
    		throw new Error("<PaletteLayers>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var clickOutside = (element, fn) => {
      const handler = (e) => {
        if(!element.contains(e.target)){
          e.preventDefault();
          fn.call(null);
        }
      };
      window.addEventListener('click', handler);
      return {
        destroy(){
          window.removeEventListener('click', handler);
        }
      }
    };

    /* src\_singles\buttons\CircularPillButton.svelte generated by Svelte v3.31.2 */

    const file$j = "src\\_singles\\buttons\\CircularPillButton.svelte";

    function create_fragment$m(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", "svelte-8gzkl6");
    			add_location(button, file$j, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CircularPillButton", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CircularPillButton> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots, click_handler];
    }

    class CircularPillButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CircularPillButton",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src\_components\SelectButton.svelte generated by Svelte v3.31.2 */
    const file$k = "src\\_components\\SelectButton.svelte";
    const get_list_slot_changes = dirty => ({});
    const get_list_slot_context = ctx => ({});
    const get_icon_slot_changes = dirty => ({});
    const get_icon_slot_context = ctx => ({});

    // (9:2) <CircularPillButton on:click={_ => active = !active}>
    function create_default_slot$8(ctx) {
    	let current;
    	const icon_slot_template = /*#slots*/ ctx[1].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[4], get_icon_slot_context);

    	const block = {
    		c: function create() {
    			if (icon_slot) icon_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (icon_slot) {
    				icon_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (icon_slot) {
    				if (icon_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(icon_slot, icon_slot_template, ctx, /*$$scope*/ ctx[4], dirty, get_icon_slot_changes, get_icon_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (icon_slot) icon_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(9:2) <CircularPillButton on:click={_ => active = !active}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let div1;
    	let t0;
    	let circularpillbutton;
    	let t1;
    	let div0;
    	let clickOutside_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	circularpillbutton = new CircularPillButton({
    			props: {
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	circularpillbutton.$on("click", /*click_handler*/ ctx[2]);
    	const list_slot_template = /*#slots*/ ctx[1].list;
    	const list_slot = create_slot(list_slot_template, ctx, /*$$scope*/ ctx[4], get_list_slot_context);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			create_component(circularpillbutton.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			if (list_slot) list_slot.c();
    			attr_dev(div0, "class", "dropdown svelte-1rwcx4c");
    			add_location(div0, file$k, 11, 2, 399);
    			attr_dev(div1, "class", "select-button svelte-1rwcx4c");
    			toggle_class(div1, "active", /*active*/ ctx[0]);
    			add_location(div1, file$k, 6, 0, 186);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append_dev(div1, t0);
    			mount_component(circularpillbutton, div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			if (list_slot) {
    				list_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(clickOutside_action = clickOutside.call(null, div1, /*clickOutside_function*/ ctx[3]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			const circularpillbutton_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				circularpillbutton_changes.$$scope = { dirty, ctx };
    			}

    			circularpillbutton.$set(circularpillbutton_changes);

    			if (list_slot) {
    				if (list_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(list_slot, list_slot_template, ctx, /*$$scope*/ ctx[4], dirty, get_list_slot_changes, get_list_slot_context);
    				}
    			}

    			if (clickOutside_action && is_function(clickOutside_action.update) && dirty & /*active*/ 1) clickOutside_action.update.call(null, /*clickOutside_function*/ ctx[3]);

    			if (dirty & /*active*/ 1) {
    				toggle_class(div1, "active", /*active*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(circularpillbutton.$$.fragment, local);
    			transition_in(list_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(circularpillbutton.$$.fragment, local);
    			transition_out(list_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			destroy_component(circularpillbutton);
    			if (list_slot) list_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SelectButton", slots, ['default','icon','list']);
    	let active = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => $$invalidate(0, active = !active);
    	const clickOutside_function = _ => $$invalidate(0, active = false);

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ clickOutside, CircularPillButton, active });

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, slots, click_handler, clickOutside_function, $$scope];
    }

    class SelectButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectButton",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src\_components\ArtboardOptions.svelte generated by Svelte v3.31.2 */
    const file$l = "src\\_components\\ArtboardOptions.svelte";

    function create_fragment$o(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let button;
    	let svg;
    	let path;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			div1 = element("div");
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(div0, "class", "group svelte-1ux55nb");
    			add_location(div0, file$l, 6, 2, 141);
    			attr_dev(path, "d", "M10.573 3.021h7.427v-3.021l6 5.39-6 5.61v-3h-7.427c-3.071 0-5.561 2.356-5.561 5.427 0 3.071 2.489 5.573 5.561 5.573h7.427v5h-7.427c-5.84 0-10.573-4.734-10.573-10.573s4.733-10.406 10.573-10.406z");
    			add_location(path, file$l, 10, 138, 354);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "13");
    			attr_dev(svg, "height", "13");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-1ux55nb");
    			add_location(svg, file$l, 10, 55, 271);
    			attr_dev(button, "class", "svelte-1ux55nb");
    			add_location(button, file$l, 10, 4, 220);
    			attr_dev(div1, "class", "group svelte-1ux55nb");
    			add_location(div1, file$l, 9, 2, 195);
    			attr_dev(div2, "id", "buttons");
    			attr_dev(div2, "class", "svelte-1ux55nb");
    			add_location(div2, file$l, 5, 0, 119);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div2, t);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ArtboardOptions", slots, ['default']);
    	const dispatch = createEventDispatcher();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ArtboardOptions> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => dispatch("centerArtboard");

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ createEventDispatcher, dispatch });
    	return [dispatch, $$scope, slots, click_handler];
    }

    class ArtboardOptions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ArtboardOptions",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src\_components\graphics\SpritesheetOptions.svelte generated by Svelte v3.31.2 */
    const file$m = "src\\_components\\graphics\\SpritesheetOptions.svelte";
    const get_default_slot_changes_1 = dirty => ({});
    const get_default_slot_context_1 = ctx => ({ slot: "list" });
    const get_default_slot_changes$1 = dirty => ({});
    const get_default_slot_context$1 = ctx => ({ slot: "icon" });

    // (11:4) <slot slot="icon">        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"><path d="M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"/></svg>      </slot>      <slot slot="list">              <div>          <Button on:click={_ => ActionsManager.execute('spritesheet_import')}
    function create_icon_slot(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[0].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context$1);
    	const default_slot_or_fallback = default_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_default_slot_changes$1, get_default_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_icon_slot.name,
    		type: "slot",
    		source: "(11:4) <slot slot=\\\"icon\\\">        <svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"13\\\" height=\\\"13\\\" viewBox=\\\"0 0 24 24\\\"><path d=\\\"M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z\\\"/></svg>      </slot>      <slot slot=\\\"list\\\">              <div>          <Button on:click={_ => ActionsManager.execute('spritesheet_import')}",
    		ctx
    	});

    	return block;
    }

    // (11:22)         
    function fallback_block_1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z");
    			add_location(path, file$m, 11, 89, 454);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "13");
    			attr_dev(svg, "height", "13");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$m, 11, 6, 371);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(11:22)         ",
    		ctx
    	});

    	return block;
    }

    // (16:8) <Button on:click={_ => ActionsManager.execute('spritesheet_import')}>
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Import spritesheet");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(16:8) <Button on:click={_ => ActionsManager.execute('spritesheet_import')}>",
    		ctx
    	});

    	return block;
    }

    // (17:8) <Button on:click={_ => ActionsManager.execute('spritesheet_import_chr')}>
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Import CHR");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(17:8) <Button on:click={_ => ActionsManager.execute('spritesheet_import_chr')}>",
    		ctx
    	});

    	return block;
    }

    // (20:8) <Button on:click={_ => ActionsManager.execute('spritesheet_export')}>
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Export spritesheet");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(20:8) <Button on:click={_ => ActionsManager.execute('spritesheet_export')}>",
    		ctx
    	});

    	return block;
    }

    // (21:8) <Button on:click={_ => ActionsManager.execute('spritesheet_export_chr')}>
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Export CHR");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(21:8) <Button on:click={_ => ActionsManager.execute('spritesheet_export_chr')}>",
    		ctx
    	});

    	return block;
    }

    // (22:8) <Button on:click={_ => ActionsManager.execute('spritesheet_export_png')}>
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Export PNG");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(22:8) <Button on:click={_ => ActionsManager.execute('spritesheet_export_png')}>",
    		ctx
    	});

    	return block;
    }

    // (25:8) <Button variant="danger" on:click={_ => ActionsManager.execute('spritesheet_clear')}>
    function create_default_slot_2$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Clear all");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(25:8) <Button variant=\\\"danger\\\" on:click={_ => ActionsManager.execute('spritesheet_clear')}>",
    		ctx
    	});

    	return block;
    }

    // (14:4) <slot slot="list">              <div>          <Button on:click={_ => ActionsManager.execute('spritesheet_import')}
    function create_list_slot(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[0].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context_1);
    	const default_slot_or_fallback = default_slot || fallback_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_default_slot_changes_1, get_default_slot_context_1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_list_slot.name,
    		type: "slot",
    		source: "(14:4) <slot slot=\\\"list\\\">              <div>          <Button on:click={_ => ActionsManager.execute('spritesheet_import')}",
    		ctx
    	});

    	return block;
    }

    // (14:22)               
    function fallback_block$4(ctx) {
    	let div0;
    	let button0;
    	let t0;
    	let button1;
    	let t1;
    	let div1;
    	let button2;
    	let t2;
    	let button3;
    	let t3;
    	let button4;
    	let t4;
    	let div2;
    	let button5;
    	let current;

    	button0 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[1]);

    	button1 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_1*/ ctx[2]);

    	button2 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*click_handler_2*/ ctx[3]);

    	button3 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button3.$on("click", /*click_handler_3*/ ctx[4]);

    	button4 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button4.$on("click", /*click_handler_4*/ ctx[5]);

    	button5 = new Button({
    			props: {
    				variant: "danger",
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button5.$on("click", /*click_handler_5*/ ctx[6]);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(button1.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(button2.$$.fragment);
    			t2 = space();
    			create_component(button3.$$.fragment);
    			t3 = space();
    			create_component(button4.$$.fragment);
    			t4 = space();
    			div2 = element("div");
    			create_component(button5.$$.fragment);
    			add_location(div0, file$m, 14, 6, 1233);
    			add_location(div1, file$m, 18, 6, 1468);
    			add_location(div2, file$m, 23, 6, 1805);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(button0, div0, null);
    			append_dev(div0, t0);
    			mount_component(button1, div0, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(button2, div1, null);
    			append_dev(div1, t2);
    			mount_component(button3, div1, null);
    			append_dev(div1, t3);
    			mount_component(button4, div1, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(button5, div2, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const button2_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    			const button3_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button3_changes.$$scope = { dirty, ctx };
    			}

    			button3.$set(button3_changes);
    			const button4_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button4_changes.$$scope = { dirty, ctx };
    			}

    			button4.$set(button4_changes);
    			const button5_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button5_changes.$$scope = { dirty, ctx };
    			}

    			button5.$set(button5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			transition_in(button3.$$.fragment, local);
    			transition_in(button4.$$.fragment, local);
    			transition_in(button5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(button3.$$.fragment, local);
    			transition_out(button4.$$.fragment, local);
    			transition_out(button5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(button0);
    			destroy_component(button1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(button2);
    			destroy_component(button3);
    			destroy_component(button4);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			destroy_component(button5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$4.name,
    		type: "fallback",
    		source: "(14:22)               ",
    		ctx
    	});

    	return block;
    }

    // (10:2) <SelectButton>
    function create_default_slot_1$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(10:2) <SelectButton>",
    		ctx
    	});

    	return block;
    }

    // (9:0) <ArtboardOptions on:centerArtboard>
    function create_default_slot$9(ctx) {
    	let selectbutton;
    	let current;

    	selectbutton = new SelectButton({
    			props: {
    				$$slots: {
    					default: [create_default_slot_1$3],
    					list: [create_list_slot],
    					icon: [create_icon_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(selectbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const selectbutton_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				selectbutton_changes.$$scope = { dirty, ctx };
    			}

    			selectbutton.$set(selectbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(9:0) <ArtboardOptions on:centerArtboard>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let artboardoptions;
    	let current;

    	artboardoptions = new ArtboardOptions({
    			props: {
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	artboardoptions.$on("centerArtboard", /*centerArtboard_handler*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(artboardoptions.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(artboardoptions, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const artboardoptions_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				artboardoptions_changes.$$scope = { dirty, ctx };
    			}

    			artboardoptions.$set(artboardoptions_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(artboardoptions.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(artboardoptions.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(artboardoptions, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SpritesheetOptions", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SpritesheetOptions> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => actions.execute("spritesheet_import");
    	const click_handler_1 = _ => actions.execute("spritesheet_import_chr");
    	const click_handler_2 = _ => actions.execute("spritesheet_export");
    	const click_handler_3 = _ => actions.execute("spritesheet_export_chr");
    	const click_handler_4 = _ => actions.execute("spritesheet_export_png");
    	const click_handler_5 = _ => actions.execute("spritesheet_clear");

    	function centerArtboard_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ActionsManager: actions,
    		SelectButton,
    		Button,
    		ArtboardOptions
    	});

    	return [
    		slots,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		centerArtboard_handler,
    		$$scope
    	];
    }

    class SpritesheetOptions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SpritesheetOptions",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    /* src\modules\spritesheet_editor\Canvas.svelte generated by Svelte v3.31.2 */

    const file$n = "src\\modules\\spritesheet_editor\\Canvas.svelte";

    // (48:0) {:else}
    function create_else_block$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Please select a spritesheet and palette");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(48:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (42:0) {#if $activeLayer && $layers.length && $activePaletteLayer}
    function create_if_block$6(ctx) {
    	let div;
    	let canvas_1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			canvas_1 = element("canvas");
    			if (default_slot) default_slot.c();
    			attr_dev(canvas_1, "width", 128);
    			attr_dev(canvas_1, "height", 128);
    			attr_dev(canvas_1, "class", "svelte-1sxiybl");
    			add_location(canvas_1, file$n, 43, 4, 1078);
    			set_style(div, "--zoom", /*zoom*/ ctx[0]);
    			attr_dev(div, "class", "svelte-1sxiybl");
    			add_location(div, file$n, 42, 2, 1043);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, canvas_1);

    			if (default_slot) {
    				default_slot.m(canvas_1, null);
    			}

    			/*canvas_1_binding*/ ctx[10](canvas_1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*zoom*/ 1) {
    				set_style(div, "--zoom", /*zoom*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*canvas_1_binding*/ ctx[10](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(42:0) {#if $activeLayer && $layers.length && $activePaletteLayer}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$6, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$activeLayer*/ ctx[2] && /*$layers*/ ctx[3].length && /*$activePaletteLayer*/ ctx[4]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let $activeLayer;
    	let $layers;
    	let $activePaletteLayer;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Canvas", slots, ['default']);
    	let { zoom } = $$props;
    	const { activeLayer, layers, width, height } = Spritesheets.stores;
    	validate_store(activeLayer, "activeLayer");
    	component_subscribe($$self, activeLayer, value => $$invalidate(2, $activeLayer = value));
    	validate_store(layers, "layers");
    	component_subscribe($$self, layers, value => $$invalidate(3, $layers = value));
    	const activePaletteLayer = Palettes.stores.activeLayer;
    	validate_store(activePaletteLayer, "activePaletteLayer");
    	component_subscribe($$self, activePaletteLayer, value => $$invalidate(4, $activePaletteLayer = value));
    	let canvas;
    	let editor = new SpritesheetEditor({ width, height });

    	// bind events
    	editor.on("primary", e => primary(e));

    	editor.on("secondary", e => secondary(e));
    	editor.on("move", e => move(e));
    	editor.on("mouseup", e => mouseup(e));

    	onMount(() => {
    		// clean up
    		return () => {
    			if (editor) {
    				editor.destroy();
    			}
    		};
    	});

    	const writable_props = ["zoom"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Canvas> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			canvas = $$value;
    			$$invalidate(1, canvas);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("zoom" in $$props) $$invalidate(0, zoom = $$props.zoom);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Palettes,
    		Spritesheets,
    		SpritesheetEditor,
    		primary,
    		secondary,
    		move,
    		mouseup,
    		zoom,
    		activeLayer,
    		layers,
    		width,
    		height,
    		activePaletteLayer,
    		canvas,
    		editor,
    		$activeLayer,
    		$layers,
    		$activePaletteLayer
    	});

    	$$self.$inject_state = $$props => {
    		if ("zoom" in $$props) $$invalidate(0, zoom = $$props.zoom);
    		if ("canvas" in $$props) $$invalidate(1, canvas = $$props.canvas);
    		if ("editor" in $$props) $$invalidate(13, editor = $$props.editor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*canvas*/ 2) {
    			 if (canvas) {
    				// editor
    				editor.defineCanvas(canvas);
    			}
    		}
    	};

    	return [
    		zoom,
    		canvas,
    		$activeLayer,
    		$layers,
    		$activePaletteLayer,
    		activeLayer,
    		layers,
    		activePaletteLayer,
    		$$scope,
    		slots,
    		canvas_1_binding
    	];
    }

    class Canvas extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, { zoom: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Canvas",
    			options,
    			id: create_fragment$q.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*zoom*/ ctx[0] === undefined && !("zoom" in props)) {
    			console.warn("<Canvas> was created without expected prop 'zoom'");
    		}
    	}

    	get zoom() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\modules\spritesheet_editor\SpritesheetEditor.svelte generated by Svelte v3.31.2 */

    function create_fragment$r(ctx) {
    	let canvas;
    	let current;

    	canvas = new Canvas({
    			props: { zoom: /*zoom*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(canvas.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(canvas, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const canvas_changes = {};
    			if (dirty & /*zoom*/ 1) canvas_changes.zoom = /*zoom*/ ctx[0];
    			canvas.$set(canvas_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(canvas.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(canvas.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(canvas, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SpritesheetEditor", slots, []);
    	let { zoom } = $$props;
    	const writable_props = ["zoom"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SpritesheetEditor> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("zoom" in $$props) $$invalidate(0, zoom = $$props.zoom);
    	};

    	$$self.$capture_state = () => ({ Canvas, zoom });

    	$$self.$inject_state = $$props => {
    		if ("zoom" in $$props) $$invalidate(0, zoom = $$props.zoom);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [zoom];
    }

    class SpritesheetEditor$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, { zoom: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SpritesheetEditor",
    			options,
    			id: create_fragment$r.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*zoom*/ ctx[0] === undefined && !("zoom" in props)) {
    			console.warn("<SpritesheetEditor> was created without expected prop 'zoom'");
    		}
    	}

    	get zoom() {
    		throw new Error("<SpritesheetEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<SpritesheetEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\_views\graphics\Spritesheets.svelte generated by Svelte v3.31.2 */
    const file$o = "src\\_views\\graphics\\Spritesheets.svelte";

    // (24:4) <Artboard on:artboardScrollEvent={changeZoomLevel}>
    function create_default_slot$a(ctx) {
    	let spritesheeteditor;
    	let current;

    	spritesheeteditor = new SpritesheetEditor$1({
    			props: { zoom: /*zoom*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(spritesheeteditor.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spritesheeteditor, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const spritesheeteditor_changes = {};
    			if (dirty & /*zoom*/ 1) spritesheeteditor_changes.zoom = /*zoom*/ ctx[0];
    			spritesheeteditor.$set(spritesheeteditor_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spritesheeteditor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spritesheeteditor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spritesheeteditor, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$a.name,
    		type: "slot",
    		source: "(24:4) <Artboard on:artboardScrollEvent={changeZoomLevel}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let section0;
    	let div0;
    	let t0;
    	let div1;
    	let spritesheetoptions;
    	let t1;
    	let artboard;
    	let t2;
    	let section1;
    	let spritesheettoolbar;
    	let t3;
    	let section2;
    	let spritesheetlayers;
    	let t4;
    	let section3;
    	let palettelayers;
    	let current;
    	spritesheetoptions = new SpritesheetOptions({ $$inline: true });
    	spritesheetoptions.$on("centerArtboard", centerScrollAndCanvas);

    	artboard = new Artboard({
    			props: {
    				$$slots: { default: [create_default_slot$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	artboard.$on("artboardScrollEvent", /*changeZoomLevel*/ ctx[1]);
    	spritesheettoolbar = new SpritesheetToolbar({ $$inline: true });
    	spritesheetlayers = new SpritesheetLayers({ $$inline: true });

    	palettelayers = new PaletteLayers({
    			props: { showEditButtons: false },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			create_component(spritesheetoptions.$$.fragment);
    			t1 = space();
    			create_component(artboard.$$.fragment);
    			t2 = space();
    			section1 = element("section");
    			create_component(spritesheettoolbar.$$.fragment);
    			t3 = space();
    			section2 = element("section");
    			create_component(spritesheetlayers.$$.fragment);
    			t4 = space();
    			section3 = element("section");
    			create_component(palettelayers.$$.fragment);
    			add_location(div0, file$o, 20, 2, 981);
    			attr_dev(div1, "class", "inner-artboard svelte-18f6yhk");
    			add_location(div1, file$o, 21, 2, 996);
    			attr_dev(section0, "class", "main-artboard svelte-18f6yhk");
    			add_location(section0, file$o, 18, 0, 895);
    			attr_dev(section1, "class", "toolbar-layer svelte-18f6yhk");
    			add_location(section1, file$o, 29, 0, 1230);
    			attr_dev(section2, "class", "spritesheets-layer svelte-18f6yhk");
    			add_location(section2, file$o, 33, 0, 1303);
    			attr_dev(section3, "class", "palettes-layer svelte-18f6yhk");
    			add_location(section3, file$o, 37, 0, 1380);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div0);
    			append_dev(section0, t0);
    			append_dev(section0, div1);
    			mount_component(spritesheetoptions, div1, null);
    			append_dev(div1, t1);
    			mount_component(artboard, div1, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, section1, anchor);
    			mount_component(spritesheettoolbar, section1, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, section2, anchor);
    			mount_component(spritesheetlayers, section2, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, section3, anchor);
    			mount_component(palettelayers, section3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const artboard_changes = {};

    			if (dirty & /*$$scope, zoom*/ 5) {
    				artboard_changes.$$scope = { dirty, ctx };
    			}

    			artboard.$set(artboard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spritesheetoptions.$$.fragment, local);
    			transition_in(artboard.$$.fragment, local);
    			transition_in(spritesheettoolbar.$$.fragment, local);
    			transition_in(spritesheetlayers.$$.fragment, local);
    			transition_in(palettelayers.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spritesheetoptions.$$.fragment, local);
    			transition_out(artboard.$$.fragment, local);
    			transition_out(spritesheettoolbar.$$.fragment, local);
    			transition_out(spritesheetlayers.$$.fragment, local);
    			transition_out(palettelayers.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			destroy_component(spritesheetoptions);
    			destroy_component(artboard);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(section1);
    			destroy_component(spritesheettoolbar);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(section2);
    			destroy_component(spritesheetlayers);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(section3);
    			destroy_component(palettelayers);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Spritesheets", slots, []);
    	let zoom = 4;

    	const changeZoomLevel = e => {
    		// TODO: find out the x,y of the cursor position and update the canvas origin
    		// so it zooms where the cursor is located. will perhaps give a nicer feel
    		// update zoom
    		$$invalidate(0, zoom = Math.max(1, zoom + (zoom - e.detail.deltaY > 0 ? 1 : -1)));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spritesheets> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Artboard,
    		centerScrollAndCanvas,
    		SpritesheetToolbar,
    		SpritesheetLayers,
    		PaletteLayers,
    		SpritesheetOptions,
    		SpritesheetEditor: SpritesheetEditor$1,
    		zoom,
    		changeZoomLevel
    	});

    	$$self.$inject_state = $$props => {
    		if ("zoom" in $$props) $$invalidate(0, zoom = $$props.zoom);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [zoom, changeZoomLevel];
    }

    class Spritesheets$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spritesheets",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    /* src\components\general\labeledartboarditem.svelte generated by Svelte v3.31.2 */

    const file$p = "src\\components\\general\\labeledartboarditem.svelte";

    // (6:2) {#if label}
    function create_if_block$7(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*label*/ ctx[0]);
    			attr_dev(div, "class", "label svelte-j9cd0w");
    			add_location(div, file$p, 6, 4, 98);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 1) set_data_dev(t, /*label*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(6:2) {#if label}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let div;
    	let t;
    	let current;
    	let if_block = /*label*/ ctx[0] && create_if_block$7(ctx);
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "labeled svelte-j9cd0w");
    			add_location(div, file$p, 4, 0, 56);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*label*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Labeledartboarditem", slots, ['default']);
    	let { label = undefined } = $$props;
    	const writable_props = ["label"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Labeledartboarditem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ label });

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, $$scope, slots];
    }

    class Labeledartboarditem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, { label: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Labeledartboarditem",
    			options,
    			id: create_fragment$t.name
    		});
    	}

    	get label() {
    		throw new Error("<Labeledartboarditem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Labeledartboarditem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\_components\graphics\PaletteOptions.svelte generated by Svelte v3.31.2 */
    const file$q = "src\\_components\\graphics\\PaletteOptions.svelte";
    const get_default_slot_changes_1$1 = dirty => ({});
    const get_default_slot_context_1$1 = ctx => ({ slot: "list" });
    const get_default_slot_changes$2 = dirty => ({});
    const get_default_slot_context$2 = ctx => ({ slot: "icon" });

    // (11:4) <slot slot="icon">        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"><path d="M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"/></svg>      </slot>      <slot slot="list">        <div>          <Button on:click={_ => ActionsManager.execute('palette_import')}
    function create_icon_slot$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[0].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], get_default_slot_context$2);
    	const default_slot_or_fallback = default_slot || fallback_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, get_default_slot_changes$2, get_default_slot_context$2);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_icon_slot$1.name,
    		type: "slot",
    		source: "(11:4) <slot slot=\\\"icon\\\">        <svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"13\\\" height=\\\"13\\\" viewBox=\\\"0 0 24 24\\\"><path d=\\\"M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z\\\"/></svg>      </slot>      <slot slot=\\\"list\\\">        <div>          <Button on:click={_ => ActionsManager.execute('palette_import')}",
    		ctx
    	});

    	return block;
    }

    // (11:22)         
    function fallback_block_1$1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z");
    			add_location(path, file$q, 11, 89, 454);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "13");
    			attr_dev(svg, "height", "13");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$q, 11, 6, 371);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1$1.name,
    		type: "fallback",
    		source: "(11:22)         ",
    		ctx
    	});

    	return block;
    }

    // (16:8) <Button on:click={_ => ActionsManager.execute('palette_import')}>
    function create_default_slot_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Import palette");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(16:8) <Button on:click={_ => ActionsManager.execute('palette_import')}>",
    		ctx
    	});

    	return block;
    }

    // (17:8) <Button on:click={_ => ActionsManager.execute('palette_export')}>
    function create_default_slot_3$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Export palette");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(17:8) <Button on:click={_ => ActionsManager.execute('palette_export')}>",
    		ctx
    	});

    	return block;
    }

    // (20:8) <Button variant="danger" on:click={_ => ActionsManager.execute('palette_clear')}>
    function create_default_slot_2$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Clear all");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(20:8) <Button variant=\\\"danger\\\" on:click={_ => ActionsManager.execute('palette_clear')}>",
    		ctx
    	});

    	return block;
    }

    // (14:4) <slot slot="list">        <div>          <Button on:click={_ => ActionsManager.execute('palette_import')}
    function create_list_slot$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[0].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], get_default_slot_context_1$1);
    	const default_slot_or_fallback = default_slot || fallback_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, get_default_slot_changes_1$1, get_default_slot_context_1$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_list_slot$1.name,
    		type: "slot",
    		source: "(14:4) <slot slot=\\\"list\\\">        <div>          <Button on:click={_ => ActionsManager.execute('palette_import')}",
    		ctx
    	});

    	return block;
    }

    // (14:22)         
    function fallback_block$5(ctx) {
    	let div0;
    	let button0;
    	let t0;
    	let button1;
    	let t1;
    	let div1;
    	let button2;
    	let current;

    	button0 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[1]);

    	button1 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_1*/ ctx[2]);

    	button2 = new Button({
    			props: {
    				variant: "danger",
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*click_handler_2*/ ctx[3]);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(button1.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(button2.$$.fragment);
    			add_location(div0, file$q, 14, 6, 1227);
    			add_location(div1, file$q, 18, 6, 1450);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(button0, div0, null);
    			append_dev(div0, t0);
    			mount_component(button1, div0, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(button2, div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const button2_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(button0);
    			destroy_component(button1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(button2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$5.name,
    		type: "fallback",
    		source: "(14:22)         ",
    		ctx
    	});

    	return block;
    }

    // (10:2) <SelectButton>
    function create_default_slot_1$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(10:2) <SelectButton>",
    		ctx
    	});

    	return block;
    }

    // (9:0) <ArtboardOptions on:centerArtboard>
    function create_default_slot$b(ctx) {
    	let selectbutton;
    	let current;

    	selectbutton = new SelectButton({
    			props: {
    				$$slots: {
    					default: [create_default_slot_1$4],
    					list: [create_list_slot$1],
    					icon: [create_icon_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(selectbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const selectbutton_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				selectbutton_changes.$$scope = { dirty, ctx };
    			}

    			selectbutton.$set(selectbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$b.name,
    		type: "slot",
    		source: "(9:0) <ArtboardOptions on:centerArtboard>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$u(ctx) {
    	let artboardoptions;
    	let current;

    	artboardoptions = new ArtboardOptions({
    			props: {
    				$$slots: { default: [create_default_slot$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	artboardoptions.$on("centerArtboard", /*centerArtboard_handler*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(artboardoptions.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(artboardoptions, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const artboardoptions_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				artboardoptions_changes.$$scope = { dirty, ctx };
    			}

    			artboardoptions.$set(artboardoptions_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(artboardoptions.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(artboardoptions.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(artboardoptions, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PaletteOptions", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PaletteOptions> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => actions.execute("palette_import");
    	const click_handler_1 = _ => actions.execute("palette_export");
    	const click_handler_2 = _ => actions.execute("palette_clear");

    	function centerArtboard_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ActionsManager: actions,
    		SelectButton,
    		Button,
    		ArtboardOptions
    	});

    	return [
    		slots,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		centerArtboard_handler,
    		$$scope
    	];
    }

    class PaletteOptions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaletteOptions",
    			options,
    			id: create_fragment$u.name
    		});
    	}
    }

    /* src\_components\graphics\SwatchList.svelte generated by Svelte v3.31.2 */

    const { console: console_1$1 } = globals;
    const file$r = "src\\_components\\graphics\\SwatchList.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (10:2) {#each NESPalette as color}
    function create_each_block$5(ctx) {
    	let li;
    	let color;
    	let current;

    	color = new Color({
    			props: {
    				rgb: /*color*/ ctx[1].rgb,
    				hex: /*color*/ ctx[1].hex,
    				type: "replace"
    			},
    			$$inline: true
    		});

    	color.$on("click", /*click*/ ctx[0]);

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(color.$$.fragment);
    			add_location(li, file$r, 10, 4, 219);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(color, li, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(color.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(color.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(color);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(10:2) {#each NESPalette as color}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$v(ctx) {
    	let ul;
    	let current;
    	let each_value = mappedColorList;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$r, 8, 0, 178);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*NESPalette, click*/ 1) {
    				each_value = mappedColorList;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SwatchList", slots, []);

    	const click = e => {
    		console.log(e);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<SwatchList> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Color, NESPalette: mappedColorList, click });
    	return [click];
    }

    class SwatchList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SwatchList",
    			options,
    			id: create_fragment$v.name
    		});
    	}
    }

    /* src\_views\graphics\Palettes.svelte generated by Svelte v3.31.2 */
    const file$s = "src\\_views\\graphics\\Palettes.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (55:6) {:else}
    function create_else_block$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No layer selected");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(55:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (43:6) {#if $activeLayer}
    function create_if_block$8(ctx) {
    	let previous_key = /*$activeLayer*/ ctx[0];
    	let key_block_anchor;
    	let current;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			key_block.c();
    			key_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			key_block.m(target, anchor);
    			insert_dev(target, key_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$activeLayer*/ 1 && safe_not_equal(previous_key, previous_key = /*$activeLayer*/ ctx[0])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block);
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(key_block_anchor);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(43:6) {#if $activeLayer}",
    		ctx
    	});

    	return block;
    }

    // (47:14) {#each $activeLayer.colors as color, colorIndex}
    function create_each_block$6(ctx) {
    	let li;
    	let color;
    	let t;
    	let drop_action;
    	let current;
    	let mounted;
    	let dispose;

    	color = new Color({
    			props: {
    				hex: /*color*/ ctx[5].hex,
    				rgb: /*color*/ ctx[5].rgb,
    				layerIndex: Palettes.layerIndexFromSource(/*$activeLayer*/ ctx[0]),
    				colorIndex: /*colorIndex*/ ctx[7],
    				type: "swap"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(color.$$.fragment);
    			t = space();
    			attr_dev(li, "class", "svelte-dgveli");
    			add_location(li, file$s, 47, 16, 1598);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(color, li, null);
    			append_dev(li, t);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(drop_action = drop.call(null, li, {
    					.../*colorDirective*/ ctx[2],
    					value: {
    						layerIndex: Palettes.layerIndexFromSource(/*$activeLayer*/ ctx[0]),
    						colorIndex: /*colorIndex*/ ctx[7]
    					}
    				}));

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const color_changes = {};
    			if (dirty & /*$activeLayer*/ 1) color_changes.hex = /*color*/ ctx[5].hex;
    			if (dirty & /*$activeLayer*/ 1) color_changes.rgb = /*color*/ ctx[5].rgb;
    			if (dirty & /*$activeLayer*/ 1) color_changes.layerIndex = Palettes.layerIndexFromSource(/*$activeLayer*/ ctx[0]);
    			color.$set(color_changes);

    			if (drop_action && is_function(drop_action.update) && dirty & /*$activeLayer*/ 1) drop_action.update.call(null, {
    				.../*colorDirective*/ ctx[2],
    				value: {
    					layerIndex: Palettes.layerIndexFromSource(/*$activeLayer*/ ctx[0]),
    					colorIndex: /*colorIndex*/ ctx[7]
    				}
    			});
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(color.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(color.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(color);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(47:14) {#each $activeLayer.colors as color, colorIndex}",
    		ctx
    	});

    	return block;
    }

    // (45:10) <Labeled label={$activeLayer.label}>
    function create_default_slot_1$5(ctx) {
    	let ul;
    	let current;
    	let each_value = /*$activeLayer*/ ctx[0].colors;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "active-color-group svelte-dgveli");
    			add_location(ul, file$s, 45, 12, 1485);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*colorDirective, Palettes, $activeLayer*/ 5) {
    				each_value = /*$activeLayer*/ ctx[0].colors;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$5.name,
    		type: "slot",
    		source: "(45:10) <Labeled label={$activeLayer.label}>",
    		ctx
    	});

    	return block;
    }

    // (44:8) {#key $activeLayer}
    function create_key_block(ctx) {
    	let labeled;
    	let current;

    	labeled = new Labeledartboarditem({
    			props: {
    				label: /*$activeLayer*/ ctx[0].label,
    				$$slots: { default: [create_default_slot_1$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(labeled.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(labeled, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const labeled_changes = {};
    			if (dirty & /*$activeLayer*/ 1) labeled_changes.label = /*$activeLayer*/ ctx[0].label;

    			if (dirty & /*$$scope, $activeLayer*/ 257) {
    				labeled_changes.$$scope = { dirty, ctx };
    			}

    			labeled.$set(labeled_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(labeled.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(labeled.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(labeled, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(44:8) {#key $activeLayer}",
    		ctx
    	});

    	return block;
    }

    // (42:4) <Artboard>
    function create_default_slot$c(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$8, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$activeLayer*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$c.name,
    		type: "slot",
    		source: "(42:4) <Artboard>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$w(ctx) {
    	let section0;
    	let div0;
    	let t0;
    	let div1;
    	let paletteoptions;
    	let t1;
    	let artboard;
    	let t2;
    	let section1;
    	let swatchlist;
    	let t3;
    	let section2;
    	let palettelayers;
    	let current;
    	paletteoptions = new PaletteOptions({ $$inline: true });
    	paletteoptions.$on("centerArtboard", centerScrollAndCanvas);

    	artboard = new Artboard({
    			props: {
    				$$slots: { default: [create_default_slot$c] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	swatchlist = new SwatchList({ $$inline: true });

    	palettelayers = new PaletteLayers({
    			props: { showEditButtons: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			create_component(paletteoptions.$$.fragment);
    			t1 = space();
    			create_component(artboard.$$.fragment);
    			t2 = space();
    			section1 = element("section");
    			create_component(swatchlist.$$.fragment);
    			t3 = space();
    			section2 = element("section");
    			create_component(palettelayers.$$.fragment);
    			add_location(div0, file$s, 38, 2, 1243);
    			attr_dev(div1, "class", "inner-artboard svelte-dgveli");
    			add_location(div1, file$s, 39, 2, 1258);
    			attr_dev(section0, "class", "main-artboard svelte-dgveli");
    			add_location(section0, file$s, 36, 0, 1157);
    			attr_dev(section1, "class", "swatchlist svelte-dgveli");
    			add_location(section1, file$s, 61, 0, 2059);
    			attr_dev(section2, "class", "palettes-layers svelte-dgveli");
    			add_location(section2, file$s, 65, 0, 2121);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div0);
    			append_dev(section0, t0);
    			append_dev(section0, div1);
    			mount_component(paletteoptions, div1, null);
    			append_dev(div1, t1);
    			mount_component(artboard, div1, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, section1, anchor);
    			mount_component(swatchlist, section1, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, section2, anchor);
    			mount_component(palettelayers, section2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const artboard_changes = {};

    			if (dirty & /*$$scope, $activeLayer*/ 257) {
    				artboard_changes.$$scope = { dirty, ctx };
    			}

    			artboard.$set(artboard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paletteoptions.$$.fragment, local);
    			transition_in(artboard.$$.fragment, local);
    			transition_in(swatchlist.$$.fragment, local);
    			transition_in(palettelayers.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paletteoptions.$$.fragment, local);
    			transition_out(artboard.$$.fragment, local);
    			transition_out(swatchlist.$$.fragment, local);
    			transition_out(palettelayers.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			destroy_component(paletteoptions);
    			destroy_component(artboard);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(section1);
    			destroy_component(swatchlist);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(section2);
    			destroy_component(palettelayers);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let $activeLayer;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Palettes", slots, []);
    	const { activeLayer, layers } = Palettes.stores;
    	validate_store(activeLayer, "activeLayer");
    	component_subscribe($$self, activeLayer, value => $$invalidate(0, $activeLayer = value));
    	let over;

    	const colorDirective = {
    		over: _ => over = true,
    		leave: _ => over = false,
    		drop: ({ e, value }) => {
    			over = false;
    			const swap = e.dataTransfer.getData("swap");

    			if (swap) {
    				layers.swapColors({ ...JSON.parse(swap), to: { ...value } });
    			}

    			// handle replacement
    			const replace = e.dataTransfer.getData("replace");

    			if (replace) {
    				layers.replaceColor({ ...JSON.parse(replace), ...value });
    			}
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Palettes> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Color,
    		Artboard,
    		centerScrollAndCanvas,
    		Labeled: Labeledartboarditem,
    		PaletteLayers,
    		PaletteOptions,
    		Palettes,
    		activeLayer,
    		layers,
    		drop,
    		SwatchList,
    		over,
    		colorDirective,
    		$activeLayer
    	});

    	$$self.$inject_state = $$props => {
    		if ("over" in $$props) over = $$props.over;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$activeLayer, activeLayer, colorDirective];
    }

    class Palettes_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Palettes_1",
    			options,
    			id: create_fragment$w.name
    		});
    	}
    }

    // sections 
    const spritesheets = decorator(Spritesheets$1);
    spritesheets('/graphics', _ => navigate('/graphics/spritesheets'));
      // catch all /gfx/:section subroutes
    spritesheets('/graphics/spritesheets', (req, res) => {
      // send the component to the view
      try{
        // enable the right shortcuts group for this page
        manager.enableGroups('*', 'spritesheets');
        res.send(Spritesheets$2);
      }catch(error){
        res.error();
      }
    });

    // palettes section
    const palettes = decorator(Palettes$1);
      // catch all /gfx/:section subroutes
    palettes('/graphics/palettes', (req, res) => {
      // send the component to the view
      try{
        // enable the right shortcuts group for this page
        manager.enableGroups('*', 'palettes');
        res.send(Palettes_1);
      }catch(error){
        res.error();
      }
    });

    // home
    app.get('/', (req, res) => {
      console.log('home');
    });

    // global commands
    // toggle fullscreen on f11 and altleft + enter combo. 
    manager.set(['f11'], { data: { action: actions.action('window_toggle_fullscreen') } });
    manager.set(['altleft', 'enter'], { data: { action: actions.action('window_toggle_fullscreen') } });

    const groups = ['palettes'];
    // global commands
    // toggle fullscreen on f11 and altleft + enter combo. 
    manager.set(['insert'], { data: { action: actions.action('palette_create') }, groups });
    manager.set(['ControlLeft', 'KeyD'], { data: { action: actions.action('palette_clone_active_layer') }, groups });

    // update active layers name
    manager.set(['f2'], { data: { action: actions.action('palette_focus_rename_active_layer') }, groups });

    // special cases since in elctron if a dialog is spawned the keyup event never triggers. so for some events it has to 
    // be handled manually where the dialog modal gets focus on the screen
    const _import = manager.set(['ControlLeft','KeyI'], { data: { action: actions.action('palette_import') }, groups });
    _import.on((args) => executeCommand(args));
    const _export = manager.set(['ControlLeft', 'KeyE'], { data: { action: actions.action('palette_export') }, groups });
    _export.on((args) => executeCommand(args));

    // register to groups
    const groups$1 = ['spritesheets'];

    // global commands
    // toggle fullscreen on f11 and altleft + enter combo. 
    manager.set(['insert'], { data: { action: actions.action('spritesheet_create')}, groups: groups$1 });
    manager.set(['ControlLeft', 'KeyD'], { data: { action: actions.action('spritesheet_clone_active_layer') }, groups: groups$1 });

    // update active layers name
    manager.set(['f2'], { data: { action: actions.action('spritesheet_focus_rename_active_layer')}, groups: groups$1 });

    // special cases since in elctron if a dialog is spawned the keyup event never triggers. so for some events it has to 
    // be handled manually where the dialog modal gets focus on the screen
    const _import$1 = manager.set(['ControlLeft','KeyI'], { data: {action: actions.action('spritesheet_import')}, groups: groups$1 });
    _import$1.on((args) => executeCommand(args));
    const _export$1 = manager.set(['ControlLeft', 'KeyE'], { data: {action: actions.action('spritesheet_export')}, groups: groups$1 });
    _export$1.on((args) => executeCommand(args));

    // set active color
    manager.set(['Digit1'], { data: {action: actions.action('palette_active_color'), props: 0}, groups: groups$1 });
    manager.set(['Digit2'], { data: {action: actions.action('palette_active_color'), props: 1}, groups: groups$1 });
    manager.set(['Digit3'], { data: {action: actions.action('palette_active_color'), props: 2}, groups: groups$1 });
    manager.set(['Digit4'], { data: {action: actions.action('palette_active_color'), props: 3}, groups: groups$1 });

    // zoom
    manager.set(['NumpadAdd'], { data: {action: actions.action('spritesheet_zoom_in')}, groups: groups$1 });
    manager.set(['NumpadSubtract'], { data: {action: actions.action('spritesheet_zoom_out')}, groups: groups$1 });
    manager.set(['Numpad0'], { data: {action: actions.action('spritesheet_zoom_reset')}, groups: groups$1 });

    // toolbar
    manager.set(['KeyV'], { data: {action: actions.action('spritesheet_set_active_tool'), props: ToolTypes.get('pointer')}, groups: groups$1 });
    manager.set(['KeyB'], { data: {action: actions.action('spritesheet_set_active_tool'), props: ToolTypes.get('pen')}, groups: groups$1 });
    manager.set(['KeyG'], { data: {action: actions.action('spritesheet_set_active_tool'), props: ToolTypes.get('paintbucket')}, groups: groups$1 });
    manager.set(['KeyM'], { data: {action: actions.action('spritesheet_set_active_tool'), props: ToolTypes.get('marquee')}, groups: groups$1 });
    manager.set(['KeyC'], { data: {action: actions.action('spritesheet_set_active_tool'), props: ToolTypes.get('preview')}, groups: groups$1 });
    manager.set(['KeyE'], { data: {action: actions.action('spritesheet_set_active_tool'), props: ToolTypes.get('eyedropper')}, groups: groups$1 });

    /* src\components\external.svelte generated by Svelte v3.31.2 */
    const file$t = "src\\components\\external.svelte";

    // (7:0) {:else}
    function create_else_block$5(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);
    	let button_levels = [/*$$props*/ ctx[1]];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			add_location(button, file$t, 7, 2, 223);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*click_handler_1*/ ctx[5]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [dirty & /*$$props*/ 2 && /*$$props*/ ctx[1]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(7:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (5:0) {#if !globalThis.electron}
    function create_if_block$9(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);
    	let button_levels = [/*$$props*/ ctx[1]];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			add_location(button, file$t, 5, 2, 140);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [dirty & /*$$props*/ 2 && /*$$props*/ ctx[1]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(5:0) {#if !globalThis.electron}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$x(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$9, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!globalThis.electron) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type();
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("External", slots, ['default']);
    	const { href } = $$props;
    	const click_handler = _ => window.open(href);
    	const click_handler_1 = _ => actions.execute("external_link", href);

    	$$self.$$set = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("$$scope" in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ ActionsManager: actions, href });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [href, $$props, $$scope, slots, click_handler, click_handler_1];
    }

    class External extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "External",
    			options,
    			id: create_fragment$x.name
    		});
    	}
    }

    /* src\_components\header\Navigation.svelte generated by Svelte v3.31.2 */
    const file$u = "src\\_components\\header\\Navigation.svelte";

    // (57:8) {#if globalThis.electron}
    function create_if_block$a(ctx) {
    	let li;
    	let button;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			span = element("span");
    			span.textContent = "quit";
    			add_location(span, file$u, 57, 86, 2344);
    			attr_dev(button, "href", "/");
    			add_location(button, file$u, 57, 14, 2272);
    			attr_dev(li, "class", "svelte-wz8iyp");
    			add_location(li, file$u, 57, 10, 2268);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, span);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_4*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(57:8) {#if globalThis.electron}",
    		ctx
    	});

    	return block;
    }

    // (78:10) <External href="https://github.com/hjalmar/nesbit-studio">
    function create_default_slot_1$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Visit github page");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$6.name,
    		type: "slot",
    		source: "(78:10) <External href=\\\"https://github.com/hjalmar/nesbit-studio\\\">",
    		ctx
    	});

    	return block;
    }

    // (81:10) <External href="https://discord.gg/WM8ZEnwbSd">
    function create_default_slot$d(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Join discord community");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$d.name,
    		type: "slot",
    		source: "(81:10) <External href=\\\"https://discord.gg/WM8ZEnwbSd\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$y(ctx) {
    	let nav;
    	let ul3;
    	let li4;
    	let span0;
    	let t1;
    	let ul0;
    	let li0;
    	let button0;
    	let span1;
    	let t3;
    	let li1;
    	let button1;
    	let span2;
    	let t5;
    	let li2;
    	let button2;
    	let span3;
    	let t7;
    	let li3;
    	let button3;
    	let span4;
    	let t9;
    	let t10;
    	let li5;
    	let span5;
    	let t12;
    	let li6;
    	let span6;
    	let t14;
    	let li8;
    	let span7;
    	let t16;
    	let ul1;
    	let li7;
    	let button4;
    	let span8;
    	let t18;
    	let li11;
    	let span9;
    	let t20;
    	let ul2;
    	let li9;
    	let external0;
    	let t21;
    	let li10;
    	let external1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = globalThis.electron && create_if_block$a(ctx);

    	external0 = new External({
    			props: {
    				href: "https://github.com/hjalmar/nesbit-studio",
    				$$slots: { default: [create_default_slot_1$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	external1 = new External({
    			props: {
    				href: "https://discord.gg/WM8ZEnwbSd",
    				$$slots: { default: [create_default_slot$d] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul3 = element("ul");
    			li4 = element("li");
    			span0 = element("span");
    			span0.textContent = "file";
    			t1 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			button0 = element("button");
    			span1 = element("span");
    			span1.textContent = "new project";
    			t3 = space();
    			li1 = element("li");
    			button1 = element("button");
    			span2 = element("span");
    			span2.textContent = "open";
    			t5 = space();
    			li2 = element("li");
    			button2 = element("button");
    			span3 = element("span");
    			span3.textContent = "save";
    			t7 = space();
    			li3 = element("li");
    			button3 = element("button");
    			span4 = element("span");
    			span4.textContent = "save as";
    			t9 = space();
    			if (if_block) if_block.c();
    			t10 = space();
    			li5 = element("li");
    			span5 = element("span");
    			span5.textContent = "edit";
    			t12 = space();
    			li6 = element("li");
    			span6 = element("span");
    			span6.textContent = "build";
    			t14 = space();
    			li8 = element("li");
    			span7 = element("span");
    			span7.textContent = "window";
    			t16 = space();
    			ul1 = element("ul");
    			li7 = element("li");
    			button4 = element("button");
    			span8 = element("span");
    			span8.textContent = "toggle fullscreen";
    			t18 = space();
    			li11 = element("li");
    			span9 = element("span");
    			span9.textContent = "help";
    			t20 = space();
    			ul2 = element("ul");
    			li9 = element("li");
    			create_component(external0.$$.fragment);
    			t21 = space();
    			li10 = element("li");
    			create_component(external1.$$.fragment);
    			add_location(span0, file$u, 50, 6, 1646);
    			add_location(span1, file$u, 52, 107, 1782);
    			attr_dev(button0, "href", "/");
    			add_location(button0, file$u, 52, 12, 1687);
    			attr_dev(li0, "class", "svelte-wz8iyp");
    			add_location(li0, file$u, 52, 8, 1683);
    			add_location(span2, file$u, 53, 99, 1920);
    			attr_dev(button1, "href", "/");
    			add_location(button1, file$u, 53, 12, 1833);
    			attr_dev(li1, "class", "svelte-wz8iyp");
    			add_location(li1, file$u, 53, 8, 1829);
    			add_location(span3, file$u, 54, 99, 2051);
    			attr_dev(button2, "href", "/");
    			add_location(button2, file$u, 54, 12, 1964);
    			attr_dev(li2, "class", "svelte-wz8iyp");
    			add_location(li2, file$u, 54, 8, 1960);
    			add_location(span4, file$u, 55, 106, 2189);
    			attr_dev(button3, "href", "/");
    			add_location(button3, file$u, 55, 12, 2095);
    			attr_dev(li3, "class", "svelte-wz8iyp");
    			add_location(li3, file$u, 55, 8, 2091);
    			attr_dev(ul0, "class", "svelte-wz8iyp");
    			add_location(ul0, file$u, 51, 6, 1670);
    			attr_dev(li4, "class", "svelte-wz8iyp");
    			toggle_class(li4, "show", false);
    			add_location(li4, file$u, 49, 4, 1616);
    			add_location(span5, file$u, 62, 6, 2427);
    			attr_dev(li5, "class", "svelte-wz8iyp");
    			add_location(li5, file$u, 61, 4, 2416);
    			add_location(span6, file$u, 65, 6, 2470);
    			attr_dev(li6, "class", "svelte-wz8iyp");
    			add_location(li6, file$u, 64, 4, 2459);
    			add_location(span7, file$u, 68, 6, 2514);
    			add_location(span8, file$u, 70, 111, 2656);
    			attr_dev(button4, "href", "/");
    			add_location(button4, file$u, 70, 12, 2557);
    			attr_dev(li7, "class", "svelte-wz8iyp");
    			add_location(li7, file$u, 70, 8, 2553);
    			attr_dev(ul1, "class", "svelte-wz8iyp");
    			add_location(ul1, file$u, 69, 6, 2540);
    			attr_dev(li8, "class", "svelte-wz8iyp");
    			add_location(li8, file$u, 67, 4, 2503);
    			add_location(span9, file$u, 74, 6, 2738);
    			attr_dev(li9, "class", "svelte-wz8iyp");
    			add_location(li9, file$u, 76, 8, 2775);
    			attr_dev(li10, "class", "svelte-wz8iyp");
    			add_location(li10, file$u, 79, 8, 2899);
    			attr_dev(ul2, "class", "svelte-wz8iyp");
    			add_location(ul2, file$u, 75, 6, 2762);
    			attr_dev(li11, "class", "svelte-wz8iyp");
    			add_location(li11, file$u, 73, 4, 2727);
    			attr_dev(ul3, "id", "filemenu");
    			attr_dev(ul3, "class", "svelte-wz8iyp");
    			add_location(ul3, file$u, 48, 2, 1593);
    			attr_dev(nav, "id", "main-nav");
    			attr_dev(nav, "class", "no-drag");
    			add_location(nav, file$u, 47, 0, 1555);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul3);
    			append_dev(ul3, li4);
    			append_dev(li4, span0);
    			append_dev(li4, t1);
    			append_dev(li4, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, button0);
    			append_dev(button0, span1);
    			append_dev(ul0, t3);
    			append_dev(ul0, li1);
    			append_dev(li1, button1);
    			append_dev(button1, span2);
    			append_dev(ul0, t5);
    			append_dev(ul0, li2);
    			append_dev(li2, button2);
    			append_dev(button2, span3);
    			append_dev(ul0, t7);
    			append_dev(ul0, li3);
    			append_dev(li3, button3);
    			append_dev(button3, span4);
    			append_dev(ul0, t9);
    			if (if_block) if_block.m(ul0, null);
    			append_dev(ul3, t10);
    			append_dev(ul3, li5);
    			append_dev(li5, span5);
    			append_dev(ul3, t12);
    			append_dev(ul3, li6);
    			append_dev(li6, span6);
    			append_dev(ul3, t14);
    			append_dev(ul3, li8);
    			append_dev(li8, span7);
    			append_dev(li8, t16);
    			append_dev(li8, ul1);
    			append_dev(ul1, li7);
    			append_dev(li7, button4);
    			append_dev(button4, span8);
    			append_dev(ul3, t18);
    			append_dev(ul3, li11);
    			append_dev(li11, span9);
    			append_dev(li11, t20);
    			append_dev(li11, ul2);
    			append_dev(ul2, li9);
    			mount_component(external0, li9, null);
    			append_dev(ul2, t21);
    			append_dev(ul2, li10);
    			mount_component(external1, li10, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", prevent_default(/*click_handler*/ ctx[0]), false, true, false),
    					listen_dev(button1, "click", prevent_default(/*click_handler_1*/ ctx[1]), false, true, false),
    					listen_dev(button2, "click", prevent_default(/*click_handler_2*/ ctx[2]), false, true, false),
    					listen_dev(button3, "click", prevent_default(/*click_handler_3*/ ctx[3]), false, true, false),
    					listen_dev(button4, "click", prevent_default(/*click_handler_5*/ ctx[5]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (globalThis.electron) if_block.p(ctx, dirty);
    			const external0_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				external0_changes.$$scope = { dirty, ctx };
    			}

    			external0.$set(external0_changes);
    			const external1_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				external1_changes.$$scope = { dirty, ctx };
    			}

    			external1.$set(external1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(external0.$$.fragment, local);
    			transition_in(external1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(external0.$$.fragment, local);
    			transition_out(external1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (if_block) if_block.d();
    			destroy_component(external0);
    			destroy_component(external1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$y($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navigation", slots, []);
    	let isActive = false;
    	let topLevelElements = [];

    	const clearActive = e => {
    		topLevelElements.forEach(_ => _.classList.remove("show"));
    		isActive = false;
    	};

    	window.addEventListener("click", clearActive);

    	// toplevel handlers
    	const toplevelClickHandler = e => {
    		e.stopPropagation();

    		// NOTE: this will toggle active menu and close menu if a sublink is clicked as well
    		isActive = !isActive;

    		e.currentTarget.classList.toggle("show");
    	};

    	const toplevelOverHandler = e => {
    		topLevelElements.forEach(_ => _.classList.remove("show"));

    		if (isActive) {
    			e.currentTarget.classList.add("show");
    		}
    	};

    	onMount(() => {
    		// top level menu
    		topLevelElements = document.querySelectorAll("nav > ul > li");

    		topLevelElements.forEach(li => li.addEventListener("click", toplevelClickHandler));
    		topLevelElements.forEach(li => li.addEventListener("mouseover", toplevelOverHandler));
    	});

    	onDestroy(() => {
    		// clear active 
    		window.removeEventListener("click", clearActive);

    		// clear toplevel
    		topLevelElements.forEach(li => li.removeEventListener("click", toplevelClickHandler));

    		topLevelElements.forEach(li => li.removeEventListener("mouseover", toplevelOverHandler));
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navigation> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => actions.execute("create_blank_project");
    	const click_handler_1 = _ => actions.execute("open_project");
    	const click_handler_2 = _ => actions.execute("save_project");
    	const click_handler_3 = _ => actions.execute("save_dialog_project");
    	const click_handler_4 = _ => actions.execute(`window_close`);
    	const click_handler_5 = _ => actions.execute("window_toggle_fullscreen");

    	$$self.$capture_state = () => ({
    		onDestroy,
    		onMount,
    		link,
    		ActionsManager: actions,
    		External,
    		isActive,
    		topLevelElements,
    		clearActive,
    		toplevelClickHandler,
    		toplevelOverHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ("isActive" in $$props) isActive = $$props.isActive;
    		if ("topLevelElements" in $$props) topLevelElements = $$props.topLevelElements;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class Navigation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigation",
    			options,
    			id: create_fragment$y.name
    		});
    	}
    }

    /* src\_singles\buttons\AreaButton.svelte generated by Svelte v3.31.2 */
    const file$v = "src\\_singles\\buttons\\AreaButton.svelte";

    function create_fragment$z(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", "no-drag svelte-1j6abr5");
    			toggle_class(button, "active", /*active*/ ctx[1]);
    			add_location(button, file$v, 15, 0, 292);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			/*button_binding*/ ctx[7](button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			if (dirty & /*active*/ 2) {
    				toggle_class(button, "active", /*active*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			/*button_binding*/ ctx[7](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$z($$self, $$props, $$invalidate) {
    	let active;
    	let $location;
    	validate_store(location$1, "location");
    	component_subscribe($$self, location$1, $$value => $$invalidate(4, $location = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AreaButton", slots, ['default']);
    	let { area = null } = $$props;
    	let _self;

    	const click = _ => {
    		if (area) {
    			navigate("/" + area);
    		}
    	};

    	const writable_props = ["area"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AreaButton> was created with unknown prop '${key}'`);
    	});

    	function button_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			_self = $$value;
    			$$invalidate(0, _self);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("area" in $$props) $$invalidate(3, area = $$props.area);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		navigate,
    		location: location$1,
    		area,
    		_self,
    		click,
    		active,
    		$location
    	});

    	$$self.$inject_state = $$props => {
    		if ("area" in $$props) $$invalidate(3, area = $$props.area);
    		if ("_self" in $$props) $$invalidate(0, _self = $$props._self);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$location, area*/ 24) {
    			// update active state
    			 $$invalidate(1, active = $location.startsWith(`/${area}`));
    		}
    	};

    	return [_self, active, click, area, $location, $$scope, slots, button_binding];
    }

    class AreaButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, { area: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AreaButton",
    			options,
    			id: create_fragment$z.name
    		});
    	}

    	get area() {
    		throw new Error("<AreaButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set area(value) {
    		throw new Error("<AreaButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\_components\header\SectionNavigation.svelte generated by Svelte v3.31.2 */
    const file$w = "src\\_components\\header\\SectionNavigation.svelte";

    // (8:4) <AreaButton area="game">
    function create_default_slot_4$2(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M6 2l1.171.203c-.355 2.245.791 2.519 2.699 2.874 1.468.273 3.13.622 3.13 3.284v.639h-1.183v-.639c0-1.556-.48-1.809-2.164-2.122-2.583-.48-4.096-1.391-3.653-4.239zm18 14c0 3.312-2.607 6-5.825 6-1.511 0-2.886-.595-3.921-1.565-1.311-1.229-3.278-1.132-4.55.038-1.03.948-2.389 1.527-3.879 1.527-3.217 0-5.825-2.688-5.825-6s2.608-6 5.825-6l12.563.007c3.118.116 5.612 2.755 5.612 5.993zm-15-1h-2v-2h-2v2h-2v2h2v2h2v-2h2v-2zm4 1h-2v1h2v-1zm4-2c0 .552.447 1 1 1s1-.448 1-1-.447-1-1-1-1 .448-1 1zm0 2c0-.552-.447-1-1-1s-1 .448-1 1 .447 1 1 1 1-.448 1-1zm2 2c0-.552-.447-1-1-1s-1 .448-1 1 .447 1 1 1 1-.448 1-1zm2-2c0-.552-.447-1-1-1s-1 .448-1 1 .447 1 1 1 1-.448 1-1z");
    			add_location(path, file$w, 8, 89, 302);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-1bhpuaq");
    			add_location(svg, file$w, 8, 6, 219);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$2.name,
    		type: "slot",
    		source: "(8:4) <AreaButton area=\\\"game\\\">",
    		ctx
    	});

    	return block;
    }

    // (13:4) <AreaButton area="graphics">
    function create_default_slot_3$3(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M0 21.398c5.504.456 3.533-5.392 8.626-5.445l2.206 1.841c.549 6.645-7.579 8.127-10.832 3.604zm16.878-8.538c1.713-2.687 7.016-11.698 7.016-11.698.423-.747-.515-1.528-1.17-.976 0 0-7.887 6.857-10.213 9.03-1.838 1.719-1.846 2.504-2.441 5.336l2.016 1.681c2.67-1.098 3.439-1.248 4.792-3.373z");
    			add_location(path, file$w, 13, 89, 1137);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-1bhpuaq");
    			add_location(svg, file$w, 13, 6, 1054);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$3.name,
    		type: "slot",
    		source: "(13:4) <AreaButton area=\\\"graphics\\\">",
    		ctx
    	});

    	return block;
    }

    // (18:4) <AreaButton area="audio">
    function create_default_slot_2$4(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M13 0h-2v15.676c-3.379-.667-7 1.915-7 4.731 0 2.367 1.881 3.593 3.919 3.593 2.423 0 5.077-1.728 5.081-5.24v-12.76c3.009 2.223 5.623 3.243 5.059 7 1.431-1.727 1.941-2.817 1.941-4.051 0-4.446-7-5.915-7-8.949z");
    			add_location(path, file$w, 18, 89, 1598);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-1bhpuaq");
    			add_location(svg, file$w, 18, 6, 1515);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$4.name,
    		type: "slot",
    		source: "(18:4) <AreaButton area=\\\"audio\\\">",
    		ctx
    	});

    	return block;
    }

    // (23:4) <AreaButton area="code">
    function create_default_slot_1$7(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M23 10.826v2.349c-1.562 0-3 1.312-3 2.857 0 2.181 1.281 5.968-6 5.968v-2.002c4.917 0 3.966-1.6 3.966-3.967 0-2.094 1.211-3.5 2.278-4.031-1.067-.531-2.278-1.438-2.278-3.312 0-2.372.94-4.692-3.966-4.686v-2.002c7.285 0 6 4.506 6 6.688 0 1.544 1.438 2.138 3 2.138zm-19-2.138c0-2.182-1.285-6.688 6-6.688v2.002c-4.906-.007-3.966 2.313-3.966 4.686 0 1.875-1.211 2.781-2.278 3.312 1.067.531 2.278 1.938 2.278 4.031 0 2.367-.951 3.967 3.966 3.967v2.002c-7.281 0-6-3.787-6-5.969 0-1.545-1.438-2.857-3-2.857v-2.349c1.562.001 3-.593 3-2.137z");
    			add_location(path, file$w, 23, 89, 1979);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-1bhpuaq");
    			add_location(svg, file$w, 23, 6, 1896);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$7.name,
    		type: "slot",
    		source: "(23:4) <AreaButton area=\\\"code\\\">",
    		ctx
    	});

    	return block;
    }

    // (27:2) {#if globalThis.electron}
    function create_if_block$b(ctx) {
    	let li;
    	let areabutton;
    	let current;
    	let mounted;
    	let dispose;

    	areabutton = new AreaButton({
    			props: {
    				$$slots: { default: [create_default_slot$e] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(areabutton.$$.fragment);
    			attr_dev(li, "class", "last svelte-1bhpuaq");
    			add_location(li, file$w, 27, 4, 2589);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(areabutton, li, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*click_handler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const areabutton_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				areabutton_changes.$$scope = { dirty, ctx };
    			}

    			areabutton.$set(areabutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(areabutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(areabutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(areabutton);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(27:2) {#if globalThis.electron}",
    		ctx
    	});

    	return block;
    }

    // (29:6) <AreaButton>
    function create_default_slot$e(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M24 19h-1v-2.2c-1.853 4.237-6.083 7.2-11 7.2-6.623 0-12-5.377-12-12h1c0 6.071 4.929 11 11 11 4.66 0 8.647-2.904 10.249-7h-2.249v-1h4v4zm-11.036 0h-1.886c-.34-.957-.437-1.571-1.177-1.878h-.001c-.743-.308-1.251.061-2.162.494l-1.333-1.333c.427-.899.804-1.415.494-2.163-.308-.74-.926-.839-1.878-1.177v-1.886c.954-.339 1.57-.437 1.878-1.178.308-.743-.06-1.248-.494-2.162l1.333-1.333c.918.436 1.421.801 2.162.494l.001-.001c.74-.307.838-.924 1.177-1.877h1.886c.34.958.437 1.57 1.177 1.877l.001.001c.743.308 1.252-.062 2.162-.494l1.333 1.333c-.435.917-.801 1.421-.494 2.161v.001c.307.739.915.835 1.878 1.178v1.886c-.953.338-1.571.437-1.878 1.178-.308.743.06 1.249.494 2.162l-1.333 1.333c-.92-.438-1.42-.802-2.157-.496-.746.31-.844.926-1.183 1.88zm-.943-4.667c-1.289 0-2.333-1.044-2.333-2.333 0-1.289 1.044-2.334 2.333-2.334 1.289 0 2.333 1.045 2.333 2.334 0 1.289-1.044 2.333-2.333 2.333zm-8.021-5.333h-4v-4h1v2.2c1.853-4.237 6.083-7.2 11-7.2 6.623 0 12 5.377 12 12h-1c0-6.071-4.929-11-11-11-4.66 0-8.647 2.904-10.249 7h2.249v1z");
    			add_location(path, file$w, 29, 131, 2821);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "fill-rule", "evenodd");
    			attr_dev(svg, "clip-rule", "evenodd");
    			attr_dev(svg, "class", "svelte-1bhpuaq");
    			add_location(svg, file$w, 29, 8, 2698);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$e.name,
    		type: "slot",
    		source: "(29:6) <AreaButton>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$A(ctx) {
    	let ul;
    	let li0;
    	let areabutton0;
    	let t0;
    	let li1;
    	let areabutton1;
    	let t1;
    	let li2;
    	let areabutton2;
    	let t2;
    	let li3;
    	let areabutton3;
    	let t3;
    	let current;

    	areabutton0 = new AreaButton({
    			props: {
    				area: "game",
    				$$slots: { default: [create_default_slot_4$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	areabutton1 = new AreaButton({
    			props: {
    				area: "graphics",
    				$$slots: { default: [create_default_slot_3$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	areabutton2 = new AreaButton({
    			props: {
    				area: "audio",
    				$$slots: { default: [create_default_slot_2$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	areabutton3 = new AreaButton({
    			props: {
    				area: "code",
    				$$slots: { default: [create_default_slot_1$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = globalThis.electron && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			create_component(areabutton0.$$.fragment);
    			t0 = space();
    			li1 = element("li");
    			create_component(areabutton1.$$.fragment);
    			t1 = space();
    			li2 = element("li");
    			create_component(areabutton2.$$.fragment);
    			t2 = space();
    			li3 = element("li");
    			create_component(areabutton3.$$.fragment);
    			t3 = space();
    			if (if_block) if_block.c();
    			attr_dev(li0, "class", "svelte-1bhpuaq");
    			add_location(li0, file$w, 6, 2, 177);
    			attr_dev(li1, "class", "svelte-1bhpuaq");
    			add_location(li1, file$w, 11, 2, 1008);
    			attr_dev(li2, "class", "svelte-1bhpuaq");
    			add_location(li2, file$w, 16, 2, 1472);
    			attr_dev(li3, "class", "svelte-1bhpuaq");
    			add_location(li3, file$w, 21, 2, 1854);
    			attr_dev(ul, "class", "area svelte-1bhpuaq");
    			add_location(ul, file$w, 5, 0, 156);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			mount_component(areabutton0, li0, null);
    			append_dev(ul, t0);
    			append_dev(ul, li1);
    			mount_component(areabutton1, li1, null);
    			append_dev(ul, t1);
    			append_dev(ul, li2);
    			mount_component(areabutton2, li2, null);
    			append_dev(ul, t2);
    			append_dev(ul, li3);
    			mount_component(areabutton3, li3, null);
    			append_dev(ul, t3);
    			if (if_block) if_block.m(ul, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const areabutton0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				areabutton0_changes.$$scope = { dirty, ctx };
    			}

    			areabutton0.$set(areabutton0_changes);
    			const areabutton1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				areabutton1_changes.$$scope = { dirty, ctx };
    			}

    			areabutton1.$set(areabutton1_changes);
    			const areabutton2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				areabutton2_changes.$$scope = { dirty, ctx };
    			}

    			areabutton2.$set(areabutton2_changes);
    			const areabutton3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				areabutton3_changes.$$scope = { dirty, ctx };
    			}

    			areabutton3.$set(areabutton3_changes);
    			if (globalThis.electron) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(areabutton0.$$.fragment, local);
    			transition_in(areabutton1.$$.fragment, local);
    			transition_in(areabutton2.$$.fragment, local);
    			transition_in(areabutton3.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(areabutton0.$$.fragment, local);
    			transition_out(areabutton1.$$.fragment, local);
    			transition_out(areabutton2.$$.fragment, local);
    			transition_out(areabutton3.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_component(areabutton0);
    			destroy_component(areabutton1);
    			destroy_component(areabutton2);
    			destroy_component(areabutton3);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$A($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SectionNavigation", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SectionNavigation> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => actions.execute("buildandrun_project");
    	$$self.$capture_state = () => ({ AreaButton, ActionsManager: actions });
    	return [click_handler];
    }

    class SectionNavigation$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SectionNavigation",
    			options,
    			id: create_fragment$A.name
    		});
    	}
    }

    /* src\_components\header\WindowButtons.svelte generated by Svelte v3.31.2 */
    const file$x = "src\\_components\\header\\WindowButtons.svelte";

    function create_fragment$B(ctx) {
    	let button0;
    	let t0;
    	let button1;
    	let t1;
    	let button2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			t0 = space();
    			button1 = element("button");
    			t1 = space();
    			button2 = element("button");
    			attr_dev(button0, "class", "minimize svelte-188xc0");
    			add_location(button0, file$x, 5, 0, 166);
    			attr_dev(button1, "class", "maximize svelte-188xc0");
    			add_location(button1, file$x, 6, 0, 243);
    			attr_dev(button2, "class", "close svelte-188xc0");
    			add_location(button2, file$x, 7, 0, 320);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button2, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$B.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$B($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("WindowButtons", slots, []);
    	const windowCommand = command => actions.execute(`window_${command}`);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WindowButtons> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => windowCommand("minimize");
    	const click_handler_1 = _ => windowCommand("maximize");
    	const click_handler_2 = _ => windowCommand("close");
    	$$self.$capture_state = () => ({ ActionsManager: actions, windowCommand });
    	return [windowCommand, click_handler, click_handler_1, click_handler_2];
    }

    class WindowButtons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WindowButtons",
    			options,
    			id: create_fragment$B.name
    		});
    	}
    }

    /* src\_components\header\Header.svelte generated by Svelte v3.31.2 */
    const file$y = "src\\_components\\header\\Header.svelte";

    function create_fragment$C(ctx) {
    	let header;
    	let div0;
    	let t0;
    	let div4;
    	let div1;
    	let t1;
    	let span;
    	let t2_value = /*$projectStore*/ ctx[0].name + "";
    	let t2;
    	let t3;
    	let t4_value = (/*$projectStore*/ ctx[0].saved ? "" : "*") + "";
    	let t4;
    	let t5;
    	let div2;
    	let filemenu;
    	let t6;
    	let sectionnavigation;
    	let t7;
    	let div3;
    	let windowbuttons;
    	let current;
    	filemenu = new Navigation({ $$inline: true });
    	sectionnavigation = new SectionNavigation$1({ $$inline: true });
    	windowbuttons = new WindowButtons({ $$inline: true });

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");
    			t1 = text("[");
    			span = element("span");
    			t2 = text(t2_value);
    			t3 = text("]");
    			t4 = text(t4_value);
    			t5 = space();
    			div2 = element("div");
    			create_component(filemenu.$$.fragment);
    			t6 = space();
    			create_component(sectionnavigation.$$.fragment);
    			t7 = space();
    			div3 = element("div");
    			create_component(windowbuttons.$$.fragment);
    			attr_dev(div0, "class", "drag app-region svelte-hnfzn8");
    			add_location(div0, file$y, 8, 2, 328);
    			attr_dev(span, "class", "no-paint svelte-hnfzn8");
    			add_location(span, file$y, 11, 7, 423);
    			attr_dev(div1, "class", "titlebar svelte-hnfzn8");
    			add_location(div1, file$y, 10, 4, 392);
    			attr_dev(div2, "id", "top-navigation");
    			attr_dev(div2, "class", "svelte-hnfzn8");
    			add_location(div2, file$y, 13, 4, 525);
    			attr_dev(div3, "id", "window-buttons");
    			attr_dev(div3, "class", "svelte-hnfzn8");
    			add_location(div3, file$y, 19, 4, 668);
    			attr_dev(div4, "class", "inner svelte-hnfzn8");
    			add_location(div4, file$y, 9, 2, 367);
    			attr_dev(header, "id", "masthead");
    			attr_dev(header, "class", "svelte-hnfzn8");
    			add_location(header, file$y, 7, 0, 302);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(header, t0);
    			append_dev(header, div4);
    			append_dev(div4, div1);
    			append_dev(div1, t1);
    			append_dev(div1, span);
    			append_dev(span, t2);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div4, t5);
    			append_dev(div4, div2);
    			mount_component(filemenu, div2, null);
    			append_dev(div2, t6);
    			mount_component(sectionnavigation, div2, null);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			mount_component(windowbuttons, div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$projectStore*/ 1) && t2_value !== (t2_value = /*$projectStore*/ ctx[0].name + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*$projectStore*/ 1) && t4_value !== (t4_value = (/*$projectStore*/ ctx[0].saved ? "" : "*") + "")) set_data_dev(t4, t4_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filemenu.$$.fragment, local);
    			transition_in(sectionnavigation.$$.fragment, local);
    			transition_in(windowbuttons.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filemenu.$$.fragment, local);
    			transition_out(sectionnavigation.$$.fragment, local);
    			transition_out(windowbuttons.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(filemenu);
    			destroy_component(sectionnavigation);
    			destroy_component(windowbuttons);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$C.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$C($$self, $$props, $$invalidate) {
    	let $projectStore;
    	validate_store(projectStore, "projectStore");
    	component_subscribe($$self, projectStore, $$value => $$invalidate(0, $projectStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Filemenu: Navigation,
    		SectionNavigation: SectionNavigation$1,
    		WindowButtons,
    		projectStore,
    		$projectStore
    	});

    	return [$projectStore];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$C.name
    		});
    	}
    }

    /* src\_components\console.svelte generated by Svelte v3.31.2 */
    const file$z = "src\\_components\\console.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i].error;
    	child_ctx[5] = list[i].date;
    	return child_ctx;
    }

    // (25:4) {#if error}
    function create_if_block$c(ctx) {
    	let li;
    	let t0;
    	let t1_value = /*date*/ ctx[5] + "";
    	let t1;
    	let t2;
    	let t3_value = /*error*/ ctx[4].message + "";
    	let t3;
    	let t4;
    	let div;
    	let t6;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text("[");
    			t1 = text(t1_value);
    			t2 = text("] ( ");
    			t3 = text(t3_value);
    			t4 = text(" )\r\n        ");
    			div = element("div");
    			div.textContent = "some extra hidden details";
    			t6 = space();
    			attr_dev(div, "class", "details svelte-8fmup");
    			add_location(div, file$z, 27, 8, 582);
    			attr_dev(li, "class", "svelte-8fmup");
    			add_location(li, file$z, 25, 6, 530);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    			append_dev(li, t4);
    			append_dev(li, div);
    			append_dev(li, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errors*/ 2 && t1_value !== (t1_value = /*date*/ ctx[5] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*errors*/ 2 && t3_value !== (t3_value = /*error*/ ctx[4].message + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(25:4) {#if error}",
    		ctx
    	});

    	return block;
    }

    // (24:2) {#each errors as { error, date }}
    function create_each_block$7(ctx) {
    	let if_block_anchor;
    	let if_block = /*error*/ ctx[4] && create_if_block$c(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*error*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$c(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(24:2) {#each errors as { error, date }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$D(ctx) {
    	let ul;
    	let each_value = /*errors*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-8fmup");
    			add_location(ul, file$z, 22, 0, 444);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			/*ul_binding*/ ctx[2](ul);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*errors*/ 2) {
    				each_value = /*errors*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			/*ul_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$D.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$D($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Console", slots, []);
    	let element;
    	let errors = [];

    	const unsubscribe = log.subscribe(async store => {
    		$$invalidate(1, errors = [...store]);
    		await tick();

    		if (element) {
    			element.scrollTo({
    				top: 1000000000,
    				left: 0,
    				behavior: "smooth"
    			});
    		}
    	});

    	onDestroy(() => {
    		unsubscribe();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Console> was created with unknown prop '${key}'`);
    	});

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(0, element);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onDestroy,
    		tick,
    		log,
    		element,
    		errors,
    		unsubscribe
    	});

    	$$self.$inject_state = $$props => {
    		if ("element" in $$props) $$invalidate(0, element = $$props.element);
    		if ("errors" in $$props) $$invalidate(1, errors = $$props.errors);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [element, errors, ul_binding];
    }

    class Console extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$D, create_fragment$D, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Console",
    			options,
    			id: create_fragment$D.name
    		});
    	}
    }

    /* src\_components\Footer.svelte generated by Svelte v3.31.2 */

    const { console: console_1$2 } = globals;
    const file$A = "src\\_components\\Footer.svelte";

    function create_fragment$E(ctx) {
    	let footer;
    	let console;
    	let current;
    	console = new Console({ $$inline: true });

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			create_component(console.$$.fragment);
    			attr_dev(footer, "class", "footer svelte-zj1pup");
    			add_location(footer, file$A, 4, 0, 80);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			mount_component(console, footer, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(console.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(console.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_component(console);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$E.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$E($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Console });
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$E, create_fragment$E, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$E.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.31.2 */
    const file$B = "src\\App.svelte";

    function create_fragment$F(ctx) {
    	let div;
    	let header;
    	let t0;
    	let main;
    	let router;
    	let t1;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	router = new Router_1({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			create_component(router.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "svelte-1qff33r");
    			add_location(main, file$B, 8, 2, 210);
    			attr_dev(div, "id", "app");
    			add_location(div, file$B, 6, 0, 180);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(header, div, null);
    			append_dev(div, t0);
    			append_dev(div, main);
    			mount_component(router, main, null);
    			append_dev(div, t1);
    			mount_component(footer, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(header);
    			destroy_component(router);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$F.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$F($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router: Router_1, Header, Footer });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$F, create_fragment$F, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$F.name
    		});
    	}
    }

    /* src\Init.svelte generated by Svelte v3.31.2 */

    const { document: document_1 } = globals;
    const file$C = "src\\Init.svelte";

    function create_fragment$G(ctx) {
    	let title_value;
    	let meta;
    	let t;
    	let app;
    	let current;
    	document_1.title = title_value = "[" + /*$projectStore*/ ctx[0].name + (/*$projectStore*/ ctx[0].save ? "" : "*") + "]";
    	const app_spread_levels = [/*$$props*/ ctx[1]];
    	let app_props = {};

    	for (let i = 0; i < app_spread_levels.length; i += 1) {
    		app_props = assign(app_props, app_spread_levels[i]);
    	}

    	app = new App({ props: app_props, $$inline: true });

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			t = space();
    			create_component(app.$$.fragment);
    			attr_dev(meta, "http-equiv", "Content-Security-Policy");
    			attr_dev(meta, "content", "script-src 'self'");
    			add_location(meta, file$C, 34, 2, 1424);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, meta);
    			insert_dev(target, t, anchor);
    			mount_component(app, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$projectStore*/ 1) && title_value !== (title_value = "[" + /*$projectStore*/ ctx[0].name + (/*$projectStore*/ ctx[0].save ? "" : "*") + "]")) {
    				document_1.title = title_value;
    			}

    			const app_changes = (dirty & /*$$props*/ 2)
    			? get_spread_update(app_spread_levels, [get_spread_object(/*$$props*/ ctx[1])])
    			: {};

    			app.$set(app_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(app.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(app.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(meta);
    			if (detaching) detach_dev(t);
    			destroy_component(app, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$G.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$G($$self, $$props, $$invalidate) {
    	let $location;
    	let $projectStore;
    	validate_store(location$1, "location");
    	component_subscribe($$self, location$1, $$value => $$invalidate(2, $location = $$value));
    	validate_store(projectStore, "projectStore");
    	component_subscribe($$self, projectStore, $$value => $$invalidate(0, $projectStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Init", slots, []);

    	if (globalThis.electron) {
    		// if we are in electron context add a class to the body element
    		// of electron to be able to distinguish between webapp and electron
    		document.body.classList.add("electron");

    		// we only want to redirect on an electron application
    		// this only if you need to get the correct location of the startup page 
    		// since the initial pathname is the filepath to the local file and not '/' as we expect.
    		redirect("/");
    	}

    	// force entry at startPage during development
    	onMount(async () => {
    		// wait tick just to be sure things have been properly executed
    		await tick();

    		if (application.startPage !== $location) {
    			redirect(application.startPage);
    		}
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		tick,
    		redirect,
    		location: location$1,
    		_meta: meta,
    		projectStore,
    		application,
    		App,
    		$location,
    		$projectStore
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$projectStore, $$props];
    }

    class Init extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$G, create_fragment$G, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Init",
    			options,
    			id: create_fragment$G.name
    		});
    	}
    }

    /* src\Adblock.svelte generated by Svelte v3.31.2 */

    const file$D = "src\\Adblock.svelte";

    function create_fragment$H(ctx) {
    	let section;
    	let article;
    	let h3;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			section = element("section");
    			article = element("article");
    			h3 = element("h3");
    			h3.textContent = "This online version of NESBit Studio relies on ad-monetization to be able to continue to operate";
    			t1 = space();
    			p = element("p");
    			p.textContent = "We know, we know. Intrusive ads sucks! We do our best to keep it out of your way and experience using this tool.";
    			add_location(h3, file$D, 2, 4, 46);
    			add_location(p, file$D, 3, 4, 157);
    			attr_dev(article, "class", "svelte-weu28o");
    			add_location(article, file$D, 1, 2, 31);
    			attr_dev(section, "class", "checkered svelte-weu28o");
    			add_location(section, file$D, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, article);
    			append_dev(article, h3);
    			append_dev(article, t1);
    			append_dev(article, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$H.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$H($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Adblock", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Adblock> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Adblock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$H, create_fragment$H, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Adblock",
    			options,
    			id: create_fragment$H.name
    		});
    	}
    }

    // shift depending on if adblock or not
    let component = window.not_adblocked ? Init : Adblock;
    const app$1 = new component({
      target: document.querySelector('body')
    });

    return app$1;

}());
//# sourceMappingURL=bundle.js.map
