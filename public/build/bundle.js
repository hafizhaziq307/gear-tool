
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
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

    /* src/components/Background.svelte generated by Svelte v3.46.4 */

    const file$2 = "src/components/Background.svelte";

    function create_fragment$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "min-h-screen w-full bg-gray-800 bg-[url('/background.png')] bg-cover opacity-60 blur-lg");
    			add_location(div, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Background', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Background> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Background extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Background",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/ResultContainer.svelte generated by Svelte v3.46.4 */

    const file$1 = "src/components/ResultContainer.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (11:6) {#each results as result}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*result*/ ctx[3].title + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*result*/ ctx[3].value + "";
    	let t2;
    	let t3;
    	let t4_value = /*result*/ ctx[3].maxRoll + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = text("/");
    			t4 = text(t4_value);
    			attr_dev(td0, "class", "whitespace-nowrap py-4 px-6 font-medium text-white");
    			add_location(td0, file$1, 12, 10, 322);
    			attr_dev(td1, "class", "whitespace-nowrap py-4 px-6 text-right font-medium text-white");
    			add_location(td1, file$1, 15, 10, 439);
    			add_location(tr, file$1, 11, 8, 307);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(td1, t3);
    			append_dev(td1, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*results*/ 1 && t0_value !== (t0_value = /*result*/ ctx[3].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*results*/ 1 && t2_value !== (t2_value = /*result*/ ctx[3].value + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*results*/ 1 && t4_value !== (t4_value = /*result*/ ctx[3].maxRoll + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(11:6) {#each results as result}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let p;
    	let t1;
    	let table;
    	let tbody;
    	let t2;
    	let tr;
    	let td;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let each_value = /*results*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Result";
    			t1 = space();
    			table = element("table");
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			tr = element("tr");
    			td = element("td");
    			t3 = text(/*scores*/ ctx[1]);
    			t4 = text("% [");
    			t5 = text(/*tier*/ ctx[2]);
    			t6 = text("]");
    			attr_dev(p, "class", "text-2xl font-bold");
    			add_location(p, file$1, 7, 2, 102);
    			attr_dev(td, "colspan", "2");
    			attr_dev(td, "class", "whitespace-nowrap py-4 px-6 text-center text-3xl font-medium text-white");
    			add_location(td, file$1, 22, 8, 633);
    			add_location(tr, file$1, 21, 6, 620);
    			attr_dev(tbody, "class", "divide-y divide-gray-500 bg-gray-800");
    			add_location(tbody, file$1, 9, 4, 213);
    			attr_dev(table, "class", "min-w-full table-fixed divide-y divide-gray-200");
    			add_location(table, file$1, 8, 2, 145);
    			attr_dev(div, "class", "p-4");
    			add_location(div, file$1, 6, 0, 82);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, table);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(tbody, t2);
    			append_dev(tbody, tr);
    			append_dev(tr, td);
    			append_dev(td, t3);
    			append_dev(td, t4);
    			append_dev(td, t5);
    			append_dev(td, t6);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*results*/ 1) {
    				each_value = /*results*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*scores*/ 2) set_data_dev(t3, /*scores*/ ctx[1]);
    			if (dirty & /*tier*/ 4) set_data_dev(t5, /*tier*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ResultContainer', slots, []);
    	let { results } = $$props;
    	let { scores } = $$props;
    	let { tier } = $$props;
    	const writable_props = ['results', 'scores', 'tier'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ResultContainer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('results' in $$props) $$invalidate(0, results = $$props.results);
    		if ('scores' in $$props) $$invalidate(1, scores = $$props.scores);
    		if ('tier' in $$props) $$invalidate(2, tier = $$props.tier);
    	};

    	$$self.$capture_state = () => ({ results, scores, tier });

    	$$self.$inject_state = $$props => {
    		if ('results' in $$props) $$invalidate(0, results = $$props.results);
    		if ('scores' in $$props) $$invalidate(1, scores = $$props.scores);
    		if ('tier' in $$props) $$invalidate(2, tier = $$props.tier);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [results, scores, tier];
    }

    class ResultContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { results: 0, scores: 1, tier: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultContainer",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*results*/ ctx[0] === undefined && !('results' in props)) {
    			console.warn("<ResultContainer> was created without expected prop 'results'");
    		}

    		if (/*scores*/ ctx[1] === undefined && !('scores' in props)) {
    			console.warn("<ResultContainer> was created without expected prop 'scores'");
    		}

    		if (/*tier*/ ctx[2] === undefined && !('tier' in props)) {
    			console.warn("<ResultContainer> was created without expected prop 'tier'");
    		}
    	}

    	get results() {
    		throw new Error("<ResultContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set results(value) {
    		throw new Error("<ResultContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scores() {
    		throw new Error("<ResultContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scores(value) {
    		throw new Error("<ResultContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tier() {
    		throw new Error("<ResultContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tier(value) {
    		throw new Error("<ResultContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.4 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[12] = list;
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (151:10) {#each substats as substat}
    function create_each_block_1(ctx) {
    	let option;
    	let t0_value = /*substat*/ ctx[14].title + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*substat*/ ctx[14].title;
    			option.value = option.__value;
    			add_location(option, file, 151, 12, 3056);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(151:10) {#each substats as substat}",
    		ctx
    	});

    	return block;
    }

    // (143:4) {#each results as result}
    function create_each_block(ctx) {
    	let div;
    	let select;
    	let option;
    	let t1;
    	let input;
    	let t2;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*substats*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function select_change_handler() {
    		/*select_change_handler*/ ctx[7].call(select, /*each_value*/ ctx[12], /*result_index*/ ctx[13]);
    	}

    	function change_handler() {
    		return /*change_handler*/ ctx[8](/*result*/ ctx[11], /*each_value*/ ctx[12], /*result_index*/ ctx[13]);
    	}

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[9].call(input, /*each_value*/ ctx[12], /*result_index*/ ctx[13]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");
    			option = element("option");
    			option.textContent = "choose substat";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			input = element("input");
    			t2 = space();
    			option.__value = "";
    			option.value = option.__value;
    			add_location(option, file, 149, 10, 2965);
    			attr_dev(select, "class", "w-3/4 cursor-pointer rounded-md bg-gray-700 p-2 ring-1 ring-gray-500");
    			if (/*result*/ ctx[11].title === void 0) add_render_callback(select_change_handler);
    			add_location(select, file, 144, 8, 2765);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "w-1/4 rounded-md bg-gray-700 p-2 ring-1 ring-gray-500");
    			add_location(input, file, 156, 8, 3183);
    			attr_dev(div, "class", "flex space-x-6");
    			add_location(div, file, 143, 6, 2728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*result*/ ctx[11].title);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*result*/ ctx[11].value);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", select_change_handler),
    					listen_dev(select, "change", change_handler, false, false, false),
    					listen_dev(input, "input", input_input_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*substats*/ 16) {
    				each_value_1 = /*substats*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*results, substats*/ 24) {
    				select_option(select, /*result*/ ctx[11].title);
    			}

    			if (dirty & /*results, substats*/ 24 && input.value !== /*result*/ ctx[11].value) {
    				set_input_value(input, /*result*/ ctx[11].value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(143:4) {#each results as result}",
    		ctx
    	});

    	return block;
    }

    // (167:2) {#if isCalculate}
    function create_if_block(ctx) {
    	let resultcontainer;
    	let current;

    	resultcontainer = new ResultContainer({
    			props: {
    				results: /*results*/ ctx[3],
    				scores: /*scores*/ ctx[0],
    				tier: /*tier*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resultcontainer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resultcontainer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const resultcontainer_changes = {};
    			if (dirty & /*results*/ 8) resultcontainer_changes.results = /*results*/ ctx[3];
    			if (dirty & /*scores*/ 1) resultcontainer_changes.scores = /*scores*/ ctx[0];
    			if (dirty & /*tier*/ 4) resultcontainer_changes.tier = /*tier*/ ctx[2];
    			resultcontainer.$set(resultcontainer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resultcontainer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resultcontainer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resultcontainer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(167:2) {#if isCalculate}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let background;
    	let t0;
    	let div5;
    	let div2;
    	let div0;
    	let t2;
    	let div1;
    	let t4;
    	let div3;
    	let t5;
    	let t6;
    	let div4;
    	let button0;
    	let t8;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;
    	background = new Background({ $$inline: true });
    	let each_value = /*results*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block = /*isCalculate*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			create_component(background.$$.fragment);
    			t0 = space();
    			div5 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Lvl 72 ~ 85";
    			t2 = space();
    			div1 = element("div");
    			div1.textContent = "Epic";
    			t4 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			div4 = element("div");
    			button0 = element("button");
    			button0.textContent = "CALC";
    			t8 = space();
    			button1 = element("button");
    			button1.textContent = "RESET";
    			attr_dev(div0, "class", "w-full");
    			add_location(div0, file, 136, 4, 2552);
    			attr_dev(div1, "class", "w-full");
    			add_location(div1, file, 137, 4, 2594);
    			attr_dev(div2, "class", "flex justify-between rounded-t-md bg-red-600 p-4 text-center text-3xl font-bold");
    			add_location(div2, file, 133, 2, 2447);
    			attr_dev(div3, "class", "w-full space-y-6 p-4");
    			add_location(div3, file, 141, 2, 2657);
    			attr_dev(button0, "class", "w-full rounded-bl-md bg-emerald-600 p-4 text-lg font-bold text-gray-200 hover:bg-emerald-700");
    			add_location(button0, file, 172, 4, 3508);
    			attr_dev(button1, "class", "w-full rounded-br-md bg-gray-600 p-4 text-lg font-bold text-gray-200 hover:bg-gray-700");
    			add_location(button1, file, 179, 4, 3686);
    			attr_dev(div4, "class", "flex");
    			add_location(div4, file, 171, 2, 3485);
    			attr_dev(div5, "class", "absolute top-1/2 left-1/2 w-[40rem] -translate-x-1/2 -translate-y-1/2 space-y-5 rounded-md bg-gray-800 text-white");
    			add_location(div5, file, 129, 0, 2289);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(background, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div5, t4);
    			append_dev(div5, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			append_dev(div5, t5);
    			if (if_block) if_block.m(div5, null);
    			append_dev(div5, t6);
    			append_dev(div5, div4);
    			append_dev(div4, button0);
    			append_dev(div4, t8);
    			append_dev(div4, button1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*calculate*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*reset*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*results, substats*/ 24) {
    				each_value = /*results*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*isCalculate*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isCalculate*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div5, t6);
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
    			transition_in(background.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(background.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(background, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
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

    function setMax(value, rolls) {
    	for (const roll of rolls) {
    		if (value <= roll) {
    			return roll;
    		}
    	}

    	return NaN;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let scores = 0;
    	let isCalculate = false;
    	let tier;

    	// input
    	const substats = [
    		{
    			title: "Atk/Def/Hp/Eff/EffRes",
    			multiplier: 1,
    			maxRolls: [8, 16, 24, 32, 40, 48]
    		},
    		{
    			title: "Speed",
    			multiplier: 2,
    			maxRolls: [4, 8, 12, 16, 20, 24]
    		},
    		{
    			title: "Crit Dmg",
    			multiplier: 1.14,
    			maxRolls: [7, 14, 21, 28, 35, 42]
    		},
    		{
    			title: "Crit Chance",
    			multiplier: 1.6,
    			maxRolls: [5, 10, 15, 20, 25, 30]
    		}
    	];

    	// output
    	let results = [
    		{ title: "", value: "", maxRoll: "" },
    		{ title: "", value: "", maxRoll: "" },
    		{ title: "", value: "", maxRoll: "" },
    		{ title: "", value: "", maxRoll: "" }
    	];

    	function calculate() {
    		$$invalidate(1, isCalculate = true);

    		for (const result of results) {
    			// check the result category based on title property
    			substats.forEach(substat => {
    				if (result.title == substat.title) {
    					$$invalidate(0, scores += Number(result.value) * substat.multiplier);

    					// set max roll
    					result.maxRoll = setMax(result.value, substat.maxRolls);
    				}
    			});
    		}

    		$$invalidate(0, scores = (scores / 72 * 100).toFixed(1));
    		setTier(scores);
    	}

    	function reset() {
    		$$invalidate(0, scores = 0);
    		$$invalidate(1, isCalculate = false);
    		$$invalidate(2, tier = "");

    		$$invalidate(3, results = [
    			{ title: "", value: "", maxRoll: "" },
    			{ title: "", value: "", maxRoll: "" },
    			{ title: "", value: "", maxRoll: "" },
    			{ title: "", value: "", maxRoll: "" }
    		]);
    	}

    	function setTier(scores) {
    		if (scores <= 69) {
    			$$invalidate(2, tier = "Trash Gear");
    		} else if (scores <= 74) {
    			$$invalidate(2, tier = "Normal Gear");
    		} else if (scores <= 79) {
    			$$invalidate(2, tier = "Good Gear");
    		} else {
    			$$invalidate(2, tier = "Godly Gear");
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler(each_value, result_index) {
    		each_value[result_index].title = select_value(this);
    		$$invalidate(3, results);
    		$$invalidate(4, substats);
    	}

    	const change_handler = (result, each_value, result_index) => $$invalidate(3, each_value[result_index].value = "", results);

    	function input_input_handler(each_value, result_index) {
    		each_value[result_index].value = this.value;
    		$$invalidate(3, results);
    		$$invalidate(4, substats);
    	}

    	$$self.$capture_state = () => ({
    		Background,
    		ResultContainer,
    		scores,
    		isCalculate,
    		tier,
    		substats,
    		results,
    		calculate,
    		reset,
    		setMax,
    		setTier
    	});

    	$$self.$inject_state = $$props => {
    		if ('scores' in $$props) $$invalidate(0, scores = $$props.scores);
    		if ('isCalculate' in $$props) $$invalidate(1, isCalculate = $$props.isCalculate);
    		if ('tier' in $$props) $$invalidate(2, tier = $$props.tier);
    		if ('results' in $$props) $$invalidate(3, results = $$props.results);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		scores,
    		isCalculate,
    		tier,
    		results,
    		substats,
    		calculate,
    		reset,
    		select_change_handler,
    		change_handler,
    		input_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
